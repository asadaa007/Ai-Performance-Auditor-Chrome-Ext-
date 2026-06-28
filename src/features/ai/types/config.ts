import type { ProviderType } from './provider';

export interface AIConfig {
  provider: ProviderType;
  apiKey: string;
  model: string;
  temperature: number;
  maxTokens: number;
  ollamaBaseUrl: string;
  updatedAt: number;
}

export interface PublicAIConfig {
  provider: ProviderType;
  model: string;
  temperature: number;
  maxTokens: number;
  ollamaBaseUrl: string;
  hasApiKey: boolean;
  apiKeyMasked: string;
  updatedAt: number;
}

export const DEFAULT_AI_CONFIG: AIConfig = {
  provider: 'openai',
  apiKey: '',
  model: 'gpt-4o-mini',
  temperature: 0.2,
  maxTokens: 2048,
  ollamaBaseUrl: 'http://localhost:11434',
  updatedAt: 0,
};

export const AI_STORAGE_KEY = 'ai_performance_auditor_ai_config';
export const AI_LAST_TEST_KEY = 'ai_performance_auditor_ai_last_test';

export const AI_LIMITS = {
  maxPromptChars: 12_000,
  maxIssuesInContext: 8,
  maxResourcesPerIssue: 3,
  maxRetries: 2,
  defaultTimeoutMs: 30_000,
  rateLimitPerMinute: 20,
} as const;
