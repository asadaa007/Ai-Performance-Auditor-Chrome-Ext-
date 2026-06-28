import { AnthropicProvider } from '@features/ai/providers/AnthropicProvider';
import { CursorProvider } from '@features/ai/providers/CursorProvider';
import { GeminiProvider } from '@features/ai/providers/GeminiProvider';
import { OllamaProvider } from '@features/ai/providers/OllamaProvider';
import { OpenAIProvider } from '@features/ai/providers/OpenAIProvider';
import { OpenRouterProvider } from '@features/ai/providers/OpenRouterProvider';
import type { AIProvider, ProviderType } from '@features/ai/types/provider';

type ProviderConstructor = new () => AIProvider;

const PROVIDER_MAP: Record<ProviderType, ProviderConstructor> = {
  anthropic: AnthropicProvider,
  openai: OpenAIProvider,
  gemini: GeminiProvider,
  openrouter: OpenRouterProvider,
  ollama: OllamaProvider,
  cursor: CursorProvider,
};

export class ProviderFactory {
  static create(type: ProviderType): AIProvider {
    const ProviderClass = PROVIDER_MAP[type];
    if (!ProviderClass) {
      throw new Error(`Unsupported AI provider: ${type}`);
    }
    return new ProviderClass();
  }

  static supportedProviders(): ProviderType[] {
    return Object.keys(PROVIDER_MAP) as ProviderType[];
  }
}
