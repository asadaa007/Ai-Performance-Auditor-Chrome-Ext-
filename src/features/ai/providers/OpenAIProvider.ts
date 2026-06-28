import { BaseProvider } from '@features/ai/providers/BaseProvider';
import type { AIRequest } from '@features/ai/types/request';
import type { AIResponse, StreamChunk } from '@features/ai/types/response';
import type { AIModel, ProviderType, ValidationResult } from '@features/ai/types/provider';
import { readSseStream } from '@features/ai/utils/sseReader';
import { estimateRequestTokens } from '@features/ai/utils/tokenEstimator';

const OPENAI_API = 'https://api.openai.com/v1';

export class OpenAIProvider extends BaseProvider {
  readonly type: ProviderType = 'openai';

  async validateApiKey(apiKey?: string): Promise<ValidationResult> {
    const key = apiKey ?? this.getConfig().apiKey;
    const started = performance.now();

    try {
      const response = await this.fetchWithTimeout(`${OPENAI_API}/models`, {
        headers: { Authorization: `Bearer ${key}` },
      });

      if (!response.ok) {
        return {
          valid: false,
          message: `OpenAI API returned ${response.status}`,
          latencyMs: Math.round(performance.now() - started),
        };
      }

      return {
        valid: true,
        message: 'OpenAI API key is valid.',
        latencyMs: Math.round(performance.now() - started),
      };
    } catch (error) {
      return {
        valid: false,
        message: error instanceof Error ? error.message : String(error),
        latencyMs: Math.round(performance.now() - started),
      };
    }
  }

  async listModels(): Promise<AIModel[]> {
    const response = await this.fetchWithTimeout(`${OPENAI_API}/models`, {
      headers: { Authorization: `Bearer ${this.getConfig().apiKey}` },
    });

    if (!response.ok) {
      throw new Error(`Failed to list OpenAI models (${response.status}).`);
    }

    const data = this.parseJsonSafe<{ data?: Array<{ id: string }> }>(await response.text());
    return (data?.data ?? [])
      .filter((model) => model.id.includes('gpt'))
      .map((model) => ({ id: model.id, name: model.id, provider: this.type }));
  }

  async generate(request: AIRequest): Promise<AIResponse> {
    const started = performance.now();

    try {
      const response = await this.fetchWithTimeout(`${OPENAI_API}/chat/completions`, {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          Authorization: `Bearer ${this.getConfig().apiKey}`,
        },
        body: JSON.stringify({
          model: request.model,
          temperature: request.temperature,
          max_tokens: request.maxTokens,
          messages: [
            { role: 'system', content: request.systemPrompt },
            { role: 'user', content: request.userPrompt },
          ],
        }),
      });

      const body = await response.text();
      if (!response.ok) {
        return this.buildErrorResponse(request, started, {
          code: String(response.status),
          message: body,
          retryable: response.status >= 500,
        });
      }

      const parsed = this.parseJsonSafe<{
        choices?: Array<{ message?: { content?: string }; finish_reason?: string }>;
        usage?: { prompt_tokens?: number; completion_tokens?: number; total_tokens?: number };
      }>(body);

      return {
        id: request.id,
        content: parsed?.choices?.[0]?.message?.content ?? '',
        usage: {
          inputTokens: parsed?.usage?.prompt_tokens ?? 0,
          outputTokens: parsed?.usage?.completion_tokens ?? 0,
          totalTokens: parsed?.usage?.total_tokens ?? 0,
        },
        provider: this.type,
        model: request.model,
        finishReason: parsed?.choices?.[0]?.finish_reason === 'length' ? 'length' : 'stop',
        latencyMs: Math.round(performance.now() - started),
        error: null,
      };
    } catch (error) {
      return this.buildErrorResponse(request, started, {
        code: 'network_error',
        message: error instanceof Error ? error.message : String(error),
        retryable: true,
      });
    }
  }

  async stream(request: AIRequest, onChunk: (chunk: StreamChunk) => void): Promise<AIResponse> {
    const started = performance.now();
    let content = '';
    let finishReason: AIResponse['finishReason'] = 'stop';

    try {
      const controller = this.createAbortController();
      const response = await fetch(`${OPENAI_API}/chat/completions`, {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          Authorization: `Bearer ${this.getConfig().apiKey}`,
        },
        body: JSON.stringify({
          model: request.model,
          temperature: request.temperature,
          max_tokens: request.maxTokens,
          stream: true,
          messages: [
            { role: 'system', content: request.systemPrompt },
            { role: 'user', content: request.userPrompt },
          ],
        }),
        signal: controller.signal,
      });

      if (!response.ok) {
        const body = await response.text();
        return this.buildErrorResponse(request, started, {
          code: String(response.status),
          message: body,
          retryable: response.status >= 500,
        });
      }

      await readSseStream(
        response,
        request.id,
        this.type,
        (chunk) => {
          if (chunk.delta) {
            content += chunk.delta;
          }
          if (chunk.finishReason) {
            finishReason = chunk.finishReason;
          }
          onChunk(chunk);
        },
        controller.signal,
      );

      return {
        id: request.id,
        content,
        usage: {
          inputTokens: estimateRequestTokens(request.systemPrompt, request.userPrompt),
          outputTokens: Math.ceil(content.length / 4),
          totalTokens:
            estimateRequestTokens(request.systemPrompt, request.userPrompt) +
            Math.ceil(content.length / 4),
        },
        provider: this.type,
        model: request.model,
        finishReason,
        latencyMs: Math.round(performance.now() - started),
        error: null,
      };
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        return {
          id: request.id,
          content,
          usage: { inputTokens: 0, outputTokens: 0, totalTokens: 0 },
          provider: this.type,
          model: request.model,
          finishReason: 'cancelled',
          latencyMs: Math.round(performance.now() - started),
          error: null,
        };
      }

      return this.buildErrorResponse(request, started, {
        code: 'network_error',
        message: error instanceof Error ? error.message : String(error),
        retryable: true,
      });
    }
  }
}
