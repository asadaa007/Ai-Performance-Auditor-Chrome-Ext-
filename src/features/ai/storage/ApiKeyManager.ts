import {
  AI_LAST_TEST_KEY,
  AI_STORAGE_KEY,
  DEFAULT_AI_CONFIG,
  type AIConfig,
  type PublicAIConfig,
} from '@features/ai/types/config';
import type { HealthCheckResult } from '@features/ai/types/provider';
import { isMaskedApiKey, maskApiKey } from '@features/ai/utils/validation';

export interface AiConfigDiagnostics {
  provider: AIConfig['provider'];
  model: string;
  hasApiKey: boolean;
  apiKeyLength: number;
  storageKey: string;
  storageStatus: 'present' | 'missing' | 'invalid';
  updatedAt: number;
  temperature: number;
  maxTokens: number;
  lastTest: {
    healthy: boolean;
    message: string;
    latencyMs: number;
    testedAt: number;
  } | null;
}

export class ApiKeyManager {
  async getConfig(): Promise<AIConfig> {
    const stored = await chrome.storage.local.get(AI_STORAGE_KEY);
    const raw = stored[AI_STORAGE_KEY];

    if (!raw || typeof raw !== 'object') {
      return { ...DEFAULT_AI_CONFIG };
    }

    return {
      ...DEFAULT_AI_CONFIG,
      ...(raw as Partial<AIConfig>),
    };
  }

  async getPublicConfig(): Promise<PublicAIConfig> {
    const config = await this.getConfig();
    return this.toPublicConfig(config);
  }

  async saveConfig(partial: Partial<AIConfig>): Promise<AIConfig> {
    const current = await this.getConfig();
    const next: AIConfig = {
      ...current,
      ...partial,
      updatedAt: Date.now(),
    };

    if (partial.apiKey !== undefined) {
      if (partial.apiKey === '') {
        next.apiKey = '';
      } else if (isMaskedApiKey(partial.apiKey)) {
        next.apiKey = current.apiKey;
      } else {
        next.apiKey = partial.apiKey.trim();
      }
    } else {
      next.apiKey = current.apiKey;
    }

    await chrome.storage.local.set({ [AI_STORAGE_KEY]: next });
    return next;
  }

  async getDiagnostics(): Promise<AiConfigDiagnostics> {
    const stored = await chrome.storage.local.get([AI_STORAGE_KEY, AI_LAST_TEST_KEY]);
    const raw = stored[AI_STORAGE_KEY];
    const config = await this.getConfig();
    const lastTestRaw = stored[AI_LAST_TEST_KEY] as
      | { result: HealthCheckResult; testedAt: number }
      | undefined;

    let storageStatus: AiConfigDiagnostics['storageStatus'] = 'missing';
    if (raw && typeof raw === 'object') {
      storageStatus = 'present';
    } else if (raw !== undefined) {
      storageStatus = 'invalid';
    }

    return {
      provider: config.provider,
      model: config.model,
      hasApiKey: Boolean(config.apiKey.trim()) || config.provider === 'ollama',
      apiKeyLength: config.apiKey.length,
      storageKey: AI_STORAGE_KEY,
      storageStatus,
      updatedAt: config.updatedAt,
      temperature: config.temperature,
      maxTokens: config.maxTokens,
      lastTest: lastTestRaw
        ? {
            healthy: lastTestRaw.result.healthy,
            message: lastTestRaw.result.message,
            latencyMs: lastTestRaw.result.latencyMs,
            testedAt: lastTestRaw.testedAt,
          }
        : null,
    };
  }

  async saveLastTestResult(result: HealthCheckResult): Promise<void> {
    await chrome.storage.local.set({
      [AI_LAST_TEST_KEY]: {
        result,
        testedAt: Date.now(),
      },
    });
  }

  async clearApiKey(): Promise<void> {
    await this.saveConfig({ apiKey: '' });
  }

  toPublicConfig(config: AIConfig): PublicAIConfig {
    return {
      provider: config.provider,
      model: config.model,
      temperature: config.temperature,
      maxTokens: config.maxTokens,
      ollamaBaseUrl: config.ollamaBaseUrl,
      hasApiKey: Boolean(config.apiKey.trim()) || config.provider === 'ollama',
      apiKeyMasked: config.apiKey ? maskApiKey(config.apiKey) : '',
      updatedAt: config.updatedAt,
    };
  }
}

export const apiKeyManager = new ApiKeyManager();
