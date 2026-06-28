import type { AIRequest } from '@features/ai/types/request';
import type { AIResponse, AIResponseError, StreamChunk } from '@features/ai/types/response';
import type {
  AIProvider,
  AIModel,
  HealthCheckResult,
  ProviderRuntimeConfig,
  ProviderType,
  ValidationResult,
} from '@features/ai/types/provider';
import { AI_LIMITS } from '@features/ai/types/config';

export abstract class BaseProvider implements AIProvider {
  abstract readonly type: ProviderType;

  protected config: ProviderRuntimeConfig | null = null;
  protected abortController: AbortController | null = null;

  async initialize(config: ProviderRuntimeConfig): Promise<void> {
    this.config = config;
  }

  abstract validateApiKey(apiKey?: string): Promise<ValidationResult>;
  abstract listModels(): Promise<AIModel[]>;
  abstract generate(request: AIRequest): Promise<AIResponse>;
  abstract stream(request: AIRequest, onChunk: (chunk: StreamChunk) => void): Promise<AIResponse>;

  cancel(requestId?: string): void {
    void requestId;
    this.abortController?.abort();
    this.abortController = null;
  }

  async healthCheck(): Promise<HealthCheckResult> {
    const started = performance.now();
    const validation = await this.validateApiKey();

    return {
      healthy: validation.valid,
      provider: this.type,
      model: this.config?.model ?? '',
      latencyMs: validation.latencyMs ?? Math.round(performance.now() - started),
      message: validation.message,
    };
  }

  protected getConfig(): ProviderRuntimeConfig {
    if (!this.config) {
      throw new Error(`${this.type} provider is not initialized.`);
    }
    return this.config;
  }

  protected createAbortController(): AbortController {
    this.abortController?.abort();
    this.abortController = new AbortController();
    return this.abortController;
  }

  protected async fetchWithTimeout(
    url: string,
    init: RequestInit,
    timeoutMs: number = AI_LIMITS.defaultTimeoutMs,
  ): Promise<Response> {
    const controller = this.createAbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    try {
      return await fetch(url, { ...init, signal: controller.signal });
    } finally {
      clearTimeout(timeoutId);
    }
  }

  protected buildErrorResponse(
    request: AIRequest,
    startedAt: number,
    error: AIResponseError,
  ): AIResponse {
    return {
      id: request.id,
      content: '',
      usage: { inputTokens: 0, outputTokens: 0, totalTokens: 0 },
      provider: this.type,
      model: request.model,
      finishReason: 'error',
      latencyMs: Math.round(performance.now() - startedAt),
      error,
    };
  }

  protected parseJsonSafe<T>(text: string): T | null {
    try {
      return JSON.parse(text) as T;
    } catch {
      return null;
    }
  }
}
