export type ProviderType =
  | 'anthropic'
  | 'openai'
  | 'gemini'
  | 'openrouter'
  | 'ollama'
  | 'cursor';

export interface AIModel {
  id: string;
  name: string;
  provider: ProviderType;
  contextWindow?: number;
}

export interface ProviderRuntimeConfig {
  apiKey: string;
  model: string;
  temperature: number;
  maxTokens: number;
  baseUrl?: string;
  timeoutMs?: number;
}

export interface ValidationResult {
  valid: boolean;
  message: string;
  latencyMs?: number;
}

export interface HealthCheckResult {
  healthy: boolean;
  provider: ProviderType;
  model: string;
  latencyMs: number;
  message: string;
}

export interface AIProvider {
  readonly type: ProviderType;
  initialize(config: ProviderRuntimeConfig): Promise<void>;
  validateApiKey(apiKey?: string): Promise<ValidationResult>;
  listModels(): Promise<AIModel[]>;
  generate(request: import('./request').AIRequest): Promise<import('./response').AIResponse>;
  stream(
    request: import('./request').AIRequest,
    onChunk: (chunk: import('./response').StreamChunk) => void,
  ): Promise<import('./response').AIResponse>;
  cancel(requestId?: string): void;
  healthCheck(): Promise<HealthCheckResult>;
}

export const PROVIDER_LABELS: Record<ProviderType, string> = {
  anthropic: 'Anthropic',
  openai: 'OpenAI',
  gemini: 'Google Gemini',
  openrouter: 'OpenRouter',
  ollama: 'Ollama',
  cursor: 'Cursor',
};

export const DEFAULT_MODELS: Record<ProviderType, string> = {
  anthropic: 'claude-sonnet-4-20250514',
  openai: 'gpt-4o-mini',
  gemini: 'gemini-2.0-flash',
  openrouter: 'openai/gpt-4o-mini',
  ollama: 'llama3.2',
  cursor: 'composer-2',
};
