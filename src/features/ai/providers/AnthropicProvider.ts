import { BaseProvider } from '@features/ai/providers/BaseProvider';
import type { AIRequest } from '@features/ai/types/request';
import type { AIResponse, StreamChunk } from '@features/ai/types/response';
import type { AIModel, ProviderType, ValidationResult } from '@features/ai/types/provider';

const ANTHROPIC_API = 'https://api.anthropic.com/v1';

export class AnthropicProvider extends BaseProvider {
  readonly type: ProviderType = 'anthropic';

  async validateApiKey(apiKey?: string): Promise<ValidationResult> {
    const key = apiKey ?? this.getConfig().apiKey;
    const started = performance.now();

    try {
      const response = await this.fetchWithTimeout(`${ANTHROPIC_API}/models`, {
        headers: {
          'x-api-key': key,
          'anthropic-version': '2023-06-01',
        },
      });

      if (!response.ok) {
        const body = await response.text();
        return {
          valid: false,
          message: body || `Anthropic API returned ${response.status}`,
          latencyMs: Math.round(performance.now() - started),
        };
      }

      return {
        valid: true,
        message: 'Anthropic API key is valid.',
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
    const response = await this.fetchWithTimeout(`${ANTHROPIC_API}/models`, {
      headers: {
        'x-api-key': this.getConfig().apiKey,
        'anthropic-version': '2023-06-01',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to list Anthropic models (${response.status}).`);
    }

    const data = this.parseJsonSafe<{ data?: Array<{ id: string; display_name?: string }> }>(
      await response.text(),
    );

    return (data?.data ?? []).map((model) => ({
      id: model.id,
      name: model.display_name ?? model.id,
      provider: this.type,
    }));
  }

  async generate(request: AIRequest): Promise<AIResponse> {
    const started = performance.now();

    try {
      const response = await this.fetchWithTimeout(`${ANTHROPIC_API}/messages`, {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'x-api-key': this.getConfig().apiKey,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: request.model,
          max_tokens: request.maxTokens,
          temperature: request.temperature,
          system: request.systemPrompt,
          messages: [{ role: 'user', content: request.userPrompt }],
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
        content?: Array<{ text?: string }>;
        usage?: { input_tokens?: number; output_tokens?: number };
        stop_reason?: string;
      }>(body);

      const content = parsed?.content?.map((block) => block.text ?? '').join('') ?? '';

      return {
        id: request.id,
        content,
        usage: {
          inputTokens: parsed?.usage?.input_tokens ?? 0,
          outputTokens: parsed?.usage?.output_tokens ?? 0,
          totalTokens: (parsed?.usage?.input_tokens ?? 0) + (parsed?.usage?.output_tokens ?? 0),
        },
        provider: this.type,
        model: request.model,
        finishReason: parsed?.stop_reason === 'max_tokens' ? 'length' : 'stop',
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
