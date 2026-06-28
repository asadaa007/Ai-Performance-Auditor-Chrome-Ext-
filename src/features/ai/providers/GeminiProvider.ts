import { BaseProvider } from '@features/ai/providers/BaseProvider';
import type { AIRequest } from '@features/ai/types/request';
import type { AIResponse, StreamChunk } from '@features/ai/types/response';
import type { AIModel, ProviderType, ValidationResult } from '@features/ai/types/provider';

const GEMINI_API = 'https://generativelanguage.googleapis.com/v1beta';

export class GeminiProvider extends BaseProvider {
  readonly type: ProviderType = 'gemini';

  async validateApiKey(apiKey?: string): Promise<ValidationResult> {
    const key = apiKey ?? this.getConfig().apiKey;
    const started = performance.now();

    try {
      const response = await this.fetchWithTimeout(
        `${GEMINI_API}/models?key=${encodeURIComponent(key)}`,
        { method: 'GET' },
      );

      if (!response.ok) {
        return {
          valid: false,
          message: `Gemini API returned ${response.status}`,
          latencyMs: Math.round(performance.now() - started),
        };
      }

      return {
        valid: true,
        message: 'Gemini API key is valid.',
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
    const key = this.getConfig().apiKey;
    const response = await this.fetchWithTimeout(
      `${GEMINI_API}/models?key=${encodeURIComponent(key)}`,
      { method: 'GET' },
    );

    if (!response.ok) {
      throw new Error(`Failed to list Gemini models (${response.status}).`);
    }

    const data = this.parseJsonSafe<{ models?: Array<{ name: string; displayName?: string }> }>(
      await response.text(),
    );

    return (data?.models ?? []).map((model) => ({
      id: model.name.replace('models/', ''),
      name: model.displayName ?? model.name,
      provider: this.type,
    }));
  }

  async generate(request: AIRequest): Promise<AIResponse> {
    const started = performance.now();
    const key = this.getConfig().apiKey;

    try {
      const response = await this.fetchWithTimeout(
        `${GEMINI_API}/models/${encodeURIComponent(request.model)}:generateContent?key=${encodeURIComponent(key)}`,
        {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({
            systemInstruction: { parts: [{ text: request.systemPrompt }] },
            contents: [{ role: 'user', parts: [{ text: request.userPrompt }] }],
            generationConfig: {
              temperature: request.temperature,
              maxOutputTokens: request.maxTokens,
            },
          }),
        },
      );

      const body = await response.text();
      if (!response.ok) {
        return this.buildErrorResponse(request, started, {
          code: String(response.status),
          message: body,
          retryable: response.status >= 500,
        });
      }

      const parsed = this.parseJsonSafe<{
        candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
        usageMetadata?: {
          promptTokenCount?: number;
          candidatesTokenCount?: number;
          totalTokenCount?: number;
        };
      }>(body);

      const content =
        parsed?.candidates?.[0]?.content?.parts?.map((part) => part.text ?? '').join('') ?? '';

      return {
        id: request.id,
        content,
        usage: {
          inputTokens: parsed?.usageMetadata?.promptTokenCount ?? 0,
          outputTokens: parsed?.usageMetadata?.candidatesTokenCount ?? 0,
          totalTokens: parsed?.usageMetadata?.totalTokenCount ?? 0,
        },
        provider: this.type,
        model: request.model,
        finishReason: 'stop',
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
