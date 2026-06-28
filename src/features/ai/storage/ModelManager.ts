import type { AIModel, ProviderType } from '@features/ai/types/provider';
import { DEFAULT_MODELS } from '@features/ai/types/provider';

const MODEL_CACHE_KEY = 'ai_performance_auditor_model_cache';

export class ModelManager {
  async cacheModels(provider: ProviderType, models: AIModel[]): Promise<void> {
    const cache = await this.readCache();
    cache[provider] = {
      models,
      cachedAt: Date.now(),
    };
    await chrome.storage.session.set({ [MODEL_CACHE_KEY]: cache });
  }

  async getCachedModels(provider: ProviderType, maxAgeMs = 3_600_000): Promise<AIModel[] | null> {
    const cache = await this.readCache();
    const entry = cache[provider];
    if (!entry || Date.now() - entry.cachedAt > maxAgeMs) {
      return null;
    }
    return entry.models;
  }

  getDefaultModel(provider: ProviderType): string {
    return DEFAULT_MODELS[provider];
  }

  getFallbackModels(provider: ProviderType): AIModel[] {
    return [
      {
        id: DEFAULT_MODELS[provider],
        name: DEFAULT_MODELS[provider],
        provider,
      },
    ];
  }

  private async readCache(): Promise<Record<string, { models: AIModel[]; cachedAt: number }>> {
    const result = await chrome.storage.session.get(MODEL_CACHE_KEY);
    const cache = result[MODEL_CACHE_KEY];
    return cache && typeof cache === 'object'
      ? (cache as Record<string, { models: AIModel[]; cachedAt: number }>)
      : {};
  }
}

export const modelManager = new ModelManager();
