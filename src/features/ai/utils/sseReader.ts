import type { StreamChunk } from '@features/ai/types/response';
import type { ProviderType } from '@features/ai/types/provider';
import { streamingParser } from '@features/ai/services/StreamingParser';

export async function readSseStream(
  response: Response,
  requestId: string,
  provider: ProviderType,
  onChunk: (chunk: StreamChunk) => void,
  signal?: AbortSignal,
): Promise<void> {
  if (!response.body) {
    throw new Error('Streaming response has no body.');
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  const collect = streamingParser.createCollector(provider, requestId, onChunk);

  try {
    while (true) {
      if (signal?.aborted) {
        onChunk({ id: requestId, delta: '', done: true, finishReason: 'cancelled' });
        break;
      }

      const { done, value } = await reader.read();
      if (done) {
        break;
      }

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() ?? '';

      for (const line of lines) {
        collect(line);
      }
    }

    if (buffer.trim()) {
      collect(buffer);
    }

    onChunk({ id: requestId, delta: '', done: true, finishReason: 'stop' });
  } finally {
    reader.releaseLock();
  }
}

export function simulateStream(
  requestId: string,
  content: string,
  onChunk: (chunk: StreamChunk) => void,
  chunkSize = 24,
): void {
  for (let index = 0; index < content.length; index += chunkSize) {
    onChunk({
      id: requestId,
      delta: content.slice(index, index + chunkSize),
      done: false,
    });
  }

  onChunk({ id: requestId, delta: '', done: true, finishReason: 'stop' });
}
