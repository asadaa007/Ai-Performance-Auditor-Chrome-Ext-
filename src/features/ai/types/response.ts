import type { ProviderType } from './provider';

export type FinishReason = 'stop' | 'length' | 'cancelled' | 'error' | 'unknown';

export interface TokenUsage {
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
}

export interface AIResponseError {
  code: string;
  message: string;
  retryable: boolean;
}

export interface AIResponse {
  id: string;
  content: string;
  usage: TokenUsage;
  provider: ProviderType;
  model: string;
  finishReason: FinishReason;
  latencyMs: number;
  error: AIResponseError | null;
}

export interface StreamChunk {
  id: string;
  delta: string;
  done: boolean;
  finishReason?: FinishReason;
}
