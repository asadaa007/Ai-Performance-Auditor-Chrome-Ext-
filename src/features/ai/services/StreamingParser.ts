import type { StreamChunk } from '@features/ai/types/response';
import type { ProviderType } from '@features/ai/types/provider';

export class StreamingParser {
  parseOpenAiSseLine(line: string, requestId: string): StreamChunk | null {
    const trimmed = line.trim();
    if (!trimmed.startsWith('data:')) {
      return null;
    }

    const payload = trimmed.slice(5).trim();
    if (payload === '[DONE]') {
      return { id: requestId, delta: '', done: true, finishReason: 'stop' };
    }

    try {
      const parsed = JSON.parse(payload) as {
        choices?: Array<{ delta?: { content?: string }; finish_reason?: string | null }>;
      };
      const delta = parsed.choices?.[0]?.delta?.content ?? '';
      const finishReason = parsed.choices?.[0]?.finish_reason;

      return {
        id: requestId,
        delta,
        done: Boolean(finishReason),
        finishReason: finishReason === 'length' ? 'length' : finishReason ? 'stop' : undefined,
      };
    } catch {
      return null;
    }
  }

  parseAnthropicSseLine(line: string, requestId: string): StreamChunk | null {
    if (!line.startsWith('data:')) {
      return null;
    }

    try {
      const parsed = JSON.parse(line.slice(5).trim()) as {
        type?: string;
        delta?: { text?: string };
      };

      if (parsed.type === 'message_stop') {
        return { id: requestId, delta: '', done: true, finishReason: 'stop' };
      }

      if (parsed.type === 'content_block_delta') {
        return {
          id: requestId,
          delta: parsed.delta?.text ?? '',
          done: false,
        };
      }
    } catch {
      return null;
    }

    return null;
  }

  createCollector(
    provider: ProviderType,
    requestId: string,
    onChunk: (chunk: StreamChunk) => void,
  ): (line: string) => void {
    return (line: string) => {
      const chunk =
        provider === 'anthropic'
          ? this.parseAnthropicSseLine(line, requestId)
          : this.parseOpenAiSseLine(line, requestId);

      if (chunk && (chunk.delta || chunk.done)) {
        onChunk(chunk);
      }
    };
  }
}

export const streamingParser = new StreamingParser();
