import { ProviderFactory } from '@features/ai/providers/ProviderFactory';
import { promptBuilder } from '@features/ai/prompt/PromptBuilder';
import { apiKeyManager } from '@features/ai/storage/ApiKeyManager';
import { modelManager } from '@features/ai/storage/ModelManager';
import { rateLimiter } from '@features/ai/services/RateLimiter';
import { AI_LIMITS, type AIConfig } from '@features/ai/types/config';
import type { AIRequest, PromptBuilderInput } from '@features/ai/types/request';
import type { AIResponse, StreamChunk } from '@features/ai/types/response';
import type { HealthCheckResult, ProviderRuntimeConfig } from '@features/ai/types/provider';
import {
  assertProviderApiKey,
  isMaskedApiKey,
  isValidMaxTokens,
  isValidTemperature,
} from '@features/ai/utils/validation';
import { estimateRequestTokens } from '@features/ai/utils/tokenEstimator';
import { normalizeWhitespace } from '@features/ai/utils/markdown';

export class AIService {
  async getPublicConfig() {
    return apiKeyManager.getPublicConfig();
  }

  async getDiagnostics() {
    return apiKeyManager.getDiagnostics();
  }

  async saveConfig(partial: Partial<AIConfig>): Promise<void> {
    if (partial.temperature !== undefined && !isValidTemperature(partial.temperature)) {
      throw new Error('Temperature must be between 0 and 2.');
    }
    if (partial.maxTokens !== undefined && !isValidMaxTokens(partial.maxTokens)) {
      throw new Error('Max tokens must be between 256 and 16384.');
    }
    await apiKeyManager.saveConfig(partial);
  }

  buildPrompt(input: PromptBuilderInput, config: AIConfig): AIRequest {
    return promptBuilder.build(input, config);
  }

  async buildPromptAsync(input: PromptBuilderInput): Promise<AIRequest> {
    const config = await apiKeyManager.getConfig();
    return this.buildPrompt(input, config);
  }

  estimateTokens(request: AIRequest): number {
    return (
      request.estimatedInputTokens ??
      estimateRequestTokens(request.systemPrompt, request.userPrompt)
    );
  }

  async testConnection(overrides?: Partial<AIConfig>): Promise<HealthCheckResult> {
    const config = await this.resolveConfig(overrides);
    const provider = await this.createInitializedProvider(config);
    const result = await provider.healthCheck();

    if (overrides?.apiKey && !isMaskedApiKey(overrides.apiKey) && result.healthy) {
      await apiKeyManager.saveConfig({ apiKey: overrides.apiKey.trim() });
    }

    await apiKeyManager.saveLastTestResult(result);
    return result;
  }

  async listModels(overrides?: Partial<AIConfig>) {
    const config = await this.resolveConfig(overrides);
    const provider = await this.createInitializedProvider(config);

    try {
      const models = await provider.listModels();
      await modelManager.cacheModels(config.provider, models);
      return models;
    } catch {
      return modelManager.getFallbackModels(config.provider);
    }
  }

  async generate(request: AIRequest, config?: AIConfig): Promise<AIResponse> {
    await rateLimiter.acquire();
    const resolved = config ?? (await apiKeyManager.getConfig());
    const provider = await this.createInitializedProvider(resolved);

    let attempt = 0;
    let lastResponse: AIResponse | null = null;

    while (attempt <= AI_LIMITS.maxRetries) {
      const response = await provider.generate(request);
      lastResponse = response;

      if (!response.error || !response.error.retryable) {
        return this.normalizeResponse(response);
      }

      attempt += 1;
    }

    return this.normalizeResponse(
      lastResponse ?? {
        id: request.id,
        content: '',
        usage: { inputTokens: 0, outputTokens: 0, totalTokens: 0 },
        provider: request.provider,
        model: request.model,
        finishReason: 'error',
        latencyMs: 0,
        error: { code: 'unknown', message: 'Request failed.', retryable: false },
      },
    );
  }

  cancel(providerType?: import('@features/ai/types').ProviderType): void {
    const type = providerType ?? this.activeProviderType;
    if (!type) {
      return;
    }
    ProviderFactory.create(type).cancel();
    if (this.activeProviderType === type) {
      this.activeProviderType = null;
    }
  }

  async streamExplain(
    request: AIRequest,
    onChunk: (chunk: StreamChunk) => void,
    config?: AIConfig,
  ): Promise<AIResponse> {
    await rateLimiter.acquire();
    const resolved = config ?? (await apiKeyManager.getConfig());
    const provider = await this.createInitializedProvider(resolved);
    this.activeProviderType = resolved.provider;

    try {
      const response = await provider.stream(request, onChunk);
      return this.normalizeResponse(response);
    } finally {
      this.activeProviderType = null;
    }
  }

  private activeProviderType: import('@features/ai/types').ProviderType | null = null;

  private async resolveConfig(overrides?: Partial<AIConfig>): Promise<AIConfig> {
    const stored = await apiKeyManager.getConfig();
    return { ...stored, ...overrides };
  }

  private async createInitializedProvider(config: AIConfig) {
    assertProviderApiKey(config.provider, config.apiKey);

    const runtime: ProviderRuntimeConfig = {
      apiKey: config.apiKey,
      model: config.model,
      temperature: config.temperature,
      maxTokens: config.maxTokens,
      baseUrl: config.ollamaBaseUrl,
    };

    const provider = ProviderFactory.create(config.provider);
    await provider.initialize(runtime);
    return provider;
  }

  private normalizeResponse(response: AIResponse): AIResponse {
    return {
      ...response,
      content: normalizeWhitespace(response.content),
    };
  }
}

export const aiService = new AIService();
