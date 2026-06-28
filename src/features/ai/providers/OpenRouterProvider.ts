import { BaseProvider } from '@features/ai/providers/BaseProvider';
import type { AIRequest } from '@features/ai/types/request';
import type { AIResponse, StreamChunk } from '@features/ai/types/response';
import type { AIModel, ProviderType, ValidationResult } from '@features/ai/types/provider';

const OPENROUTER_API = 'https://openrouter.ai/api/v1';

export class OpenRouterProvider extends BaseProvider {
  readonly type: ProviderType = 'openrouter';

  private headers(): Record<string, string> {
    return {
      Authorization: `Bearer ${this.getConfig().apiKey}`,
      'HTTP-Referer': 'https://ai-performance-auditor.local',
      'X-Title': 'AI Performance Auditor',
    };
  }

  async validateApiKey(apiKey?: string): Promise<ValidationResult> {
    const key = apiKey ?? this.getConfig().apiKey;
    const started = performance.now();

    try {
      const response = await this.fetchWithTimeout(`${OPENROUTER_API}/models`, {
        headers: {
          ...this.headers(),
          Authorization: `Bearer ${key}`,
        },
      });

      return {
        valid: response.ok,
        message: response.ok
          ? 'OpenRouter API key is valid.'
          : `OpenRouter API returned ${response.status}`,
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
    const response = await this.fetchWithTimeout(`${OPENROUTER_API}/models`, {
      headers: this.headers(),
    });

    if (!response.ok) {
      throw new Error(`Failed to list OpenRouter models (${response.status}).`);
    }

    const data = this.parseJsonSafe<{ data?: Array<{ id: string; name?: string }> }>(
      await response.text(),
    );

    return (data?.data ?? []).map((model) => ({
      id: model.id,
      name: model.name ?? model.id,
      provider: this.type,
    }));
  }

  async generate(request: AIRequest): Promise<AIResponse> {
    const started = performance.now();

    try {
      const response = await this.fetchWithTimeout(`${OPENROUTER_API}/chat/completions`, {
        method: 'POST',
        headers: { ...this.headers(), 'content-type': 'application/json' },
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
    const response = await this.generate(request);
    if (response.content) {
      onChunk({
        id: request.id,
        delta: response.content,
        done: true,
        finishReason: response.finishReason,
      });
    }
    return response;
  }
}
