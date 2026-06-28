import { BaseProvider } from '@features/ai/providers/BaseProvider';
import type { AIRequest } from '@features/ai/types/request';
import type { AIResponse, AIResponseError, StreamChunk } from '@features/ai/types/response';
import type { AIModel, ProviderType, ValidationResult } from '@features/ai/types/provider';
import { AI_LIMITS } from '@features/ai/types/config';
import { estimateRequestTokens } from '@features/ai/utils/tokenEstimator';

const CURSOR_API = 'https://api.cursor.com';
const CURSOR_AGENT_TIMEOUT_MS = 120_000;
const CURSOR_CREATE_TIMEOUT_MS = 60_000;
const CURSOR_POLL_INTERVAL_MS = 2_000;

interface CursorAgentCreateResponse {
  agent?: { id: string };
  run?: { id: string; status?: string };
}

interface CursorModelsResponse {
  items?: Array<{ id: string; displayName?: string }>;
}

interface CursorRunResponse {
  id: string;
  status: string;
  result?: string;
}

type CursorHttpError = AIResponseError & { status?: number };

function cursorHeaders(apiKey: string): HeadersInit {
  const trimmed = apiKey.trim();
  const basic = btoa(`${trimmed}:`);

  return {
    Authorization: `Basic ${basic}`,
    'Content-Type': 'application/json',
  };
}

function buildCursorPrompt(request: AIRequest): string {
  return [
    request.systemPrompt,
    '',
    'Important: Reply in this chat only. Do not create or edit files, open branches, or narrate your internal plan.',
    '',
    '---',
    '',
    request.userPrompt,
  ].join('\n');
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function mapCursorHttpError(status: number, body: string): CursorHttpError {
  const message = body.trim() || `Cursor API returned ${status}`;

  if (status === 401 || status === 403) {
    return { code: 'invalid_api_key', message, retryable: false, status };
  }
  if (status === 429) {
    return { code: 'rate_limit_exceeded', message, retryable: true, status };
  }
  if (status === 408 || status === 504) {
    return { code: 'timeout', message, retryable: true, status };
  }
  if (status >= 500) {
    return { code: 'provider_error', message, retryable: true, status };
  }

  return { code: 'cursor_api_error', message, retryable: false, status };
}

function mapCursorThrowable(error: unknown): CursorHttpError {
  if (error instanceof Error) {
    if (error.name === 'AbortError') {
      return { code: 'timeout', message: 'Cursor request timed out.', retryable: true };
    }

    const message = error.message;
    const lower = message.toLowerCase();

    if (lower.includes('failed to fetch') || lower.includes('networkerror')) {
      return {
        code: 'network_error',
        message:
          'Lost connection to Cursor while the cloud agent was running. This often happens when the extension background worker sleeps — retry after reloading the extension.',
        retryable: true,
      };
    }

    if (lower.includes('401') || lower.includes('unauthorized')) {
      return { code: 'invalid_api_key', message, retryable: false };
    }
    if (lower.includes('429') || lower.includes('rate limit')) {
      return { code: 'rate_limit_exceeded', message, retryable: true };
    }

    return { code: 'cursor_api_error', message, retryable: true };
  }

  return { code: 'unknown', message: String(error), retryable: true };
}

export class CursorProvider extends BaseProvider {
  readonly type: ProviderType = 'cursor';

  private activeAgentId: string | null = null;
  private activeRunId: string | null = null;

  async validateApiKey(apiKey?: string): Promise<ValidationResult> {
    const key = apiKey ?? this.getConfig().apiKey;
    const started = performance.now();

    try {
      const response = await this.fetchWithTimeout(`${CURSOR_API}/v1/me`, {
        headers: cursorHeaders(key),
      });

      if (!response.ok) {
        const body = await response.text();
        const mapped = mapCursorHttpError(response.status, body);
        return {
          valid: false,
          message: mapped.message,
          latencyMs: Math.round(performance.now() - started),
        };
      }

      return {
        valid: true,
        message: 'Cursor API key is valid.',
        latencyMs: Math.round(performance.now() - started),
      };
    } catch (error) {
      return {
        valid: false,
        message: error instanceof Error ? error.message : String(error),
        latencyMs: Math.round(performance.now() - started),
      };
    }
  }

  async listModels(): Promise<AIModel[]> {
    const response = await this.fetchWithTimeout(`${CURSOR_API}/v1/models`, {
      headers: cursorHeaders(this.getConfig().apiKey),
    });

    if (!response.ok) {
      throw new Error(`Failed to list Cursor models (${response.status}).`);
    }

    const data = this.parseJsonSafe<CursorModelsResponse>(await response.text());
    const items = data?.items ?? [];

    if (items.length === 0) {
      return [{ id: 'composer-2', name: 'Composer 2', provider: this.type }];
    }

    return items.map((model) => ({
      id: model.id,
      name: model.displayName ?? model.id,
      provider: this.type,
    }));
  }

  async generate(request: AIRequest): Promise<AIResponse> {
    let content = '';
    const response = await this.stream(request, (chunk) => {
      if (chunk.delta) {
        content += chunk.delta;
      }
    });
    return { ...response, content: response.content || content };
  }

  async stream(request: AIRequest, onChunk: (chunk: StreamChunk) => void): Promise<AIResponse> {
    const started = performance.now();
    this.activeAgentId = null;
    this.activeRunId = null;

    try {
      const created = await this.createAgentRun(request);
      if (!created) {
        return this.buildErrorResponse(request, started, {
          code: 'cursor_create_failed',
          message: 'Cursor agent could not be created — the API response was missing agent or run ids.',
          retryable: true,
        });
      }

      const { agentId, runId } = created;
      this.activeAgentId = agentId;
      this.activeRunId = runId;

      await this.waitForRunActive(agentId, runId);

      let content = '';
      try {
        content = await this.streamRun(agentId, runId, request.id, onChunk);
      } catch (streamError) {
        const polled = await this.pollRunResult(agentId, runId, request.id, onChunk);
        content = polled ?? '';
        if (!content) {
          throw streamError;
        }
      }

      if (!content.trim()) {
        const polled = await this.pollRunResult(agentId, runId, request.id, onChunk);
        content = polled ?? content;
      }

      void this.archiveAgent(agentId);

      onChunk({ id: request.id, delta: '', done: true, finishReason: 'stop' });

      return {
        id: request.id,
        content,
        usage: {
          inputTokens: estimateRequestTokens(request.systemPrompt, request.userPrompt),
          outputTokens: Math.ceil(content.length / 4),
          totalTokens:
            estimateRequestTokens(request.systemPrompt, request.userPrompt) +
            Math.ceil(content.length / 4),
        },
        provider: this.type,
        model: request.model,
        finishReason: 'stop',
        latencyMs: Math.round(performance.now() - started),
        error: null,
      };
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        return {
          id: request.id,
          content: '',
          usage: { inputTokens: 0, outputTokens: 0, totalTokens: 0 },
          provider: this.type,
          model: request.model,
          finishReason: 'cancelled',
          latencyMs: Math.round(performance.now() - started),
          error: null,
        };
      }

      const mapped = mapCursorThrowable(error);
      return this.buildErrorResponse(request, started, mapped);
    } finally {
      this.activeAgentId = null;
      this.activeRunId = null;
    }
  }

  cancel(requestId?: string): void {
    void requestId;
    const agentId = this.activeAgentId;
    const runId = this.activeRunId;
    this.abortController?.abort();

    if (agentId && runId) {
      void fetch(`${CURSOR_API}/v1/agents/${agentId}/runs/${runId}/cancel`, {
        method: 'POST',
        headers: cursorHeaders(this.getConfig().apiKey),
      }).catch(() => undefined);
    }
  }

  private async createAgentRun(
    request: AIRequest,
  ): Promise<{ agentId: string; runId: string } | null> {
    const response = await this.fetchWithTimeout(
      `${CURSOR_API}/v1/agents`,
      {
        method: 'POST',
        headers: cursorHeaders(this.getConfig().apiKey),
        body: JSON.stringify({
          prompt: { text: buildCursorPrompt(request) },
          model: { id: request.model },
          name: `Audit explain ${request.id.slice(0, 8)}`,
        }),
      },
      CURSOR_CREATE_TIMEOUT_MS,
    );

    const body = await response.text();
    if (!response.ok) {
      const mapped = mapCursorHttpError(response.status, body);
      throw new Error(mapped.message);
    }

    const parsed = this.parseJsonSafe<CursorAgentCreateResponse>(body);
    const agentId = parsed?.agent?.id;
    const runId = parsed?.run?.id;

    if (!agentId || !runId) {
      return null;
    }

    return { agentId, runId };
  }

  private async waitForRunActive(agentId: string, runId: string): Promise<void> {
    const deadline = Date.now() + CURSOR_CREATE_TIMEOUT_MS;

    while (Date.now() < deadline) {
      const run = await this.getRun(agentId, runId);
      if (!run) {
        await sleep(CURSOR_POLL_INTERVAL_MS);
        continue;
      }

      if (run.status === 'RUNNING' || run.status === 'FINISHED') {
        return;
      }

      if (run.status === 'ERROR' || run.status === 'CANCELLED' || run.status === 'EXPIRED') {
        throw new Error(`Cursor run ended early with status ${run.status}.`);
      }

      await sleep(CURSOR_POLL_INTERVAL_MS);
    }
  }

  private async getRun(agentId: string, runId: string): Promise<CursorRunResponse | null> {
    const response = await this.fetchWithTimeout(
      `${CURSOR_API}/v1/agents/${agentId}/runs/${runId}`,
      {
        headers: cursorHeaders(this.getConfig().apiKey),
      },
      AI_LIMITS.defaultTimeoutMs,
    );

    if (!response.ok) {
      return null;
    }

    return this.parseJsonSafe<CursorRunResponse>(await response.text());
  }

  private async pollRunResult(
    agentId: string,
    runId: string,
    requestId: string,
    onChunk: (chunk: StreamChunk) => void,
  ): Promise<string | null> {
    const deadline = Date.now() + CURSOR_AGENT_TIMEOUT_MS;

    while (Date.now() < deadline) {
      const run = await this.getRun(agentId, runId);
      if (!run) {
        await sleep(CURSOR_POLL_INTERVAL_MS);
        continue;
      }

      if (run.status === 'FINISHED' && run.result) {
        onChunk({ id: requestId, delta: run.result, done: false });
        return run.result;
      }

      if (run.status === 'ERROR' || run.status === 'CANCELLED' || run.status === 'EXPIRED') {
        throw new Error(`Cursor run failed with status ${run.status}.`);
      }

      await sleep(CURSOR_POLL_INTERVAL_MS);
    }

    return null;
  }

  private async streamRun(
    agentId: string,
    runId: string,
    requestId: string,
    onChunk: (chunk: StreamChunk) => void,
  ): Promise<string> {
    const controller = this.createAbortController();
    const timeoutId = setTimeout(() => controller.abort(), CURSOR_AGENT_TIMEOUT_MS);

    try {
      const response = await fetch(
        `${CURSOR_API}/v1/agents/${agentId}/runs/${runId}/stream`,
        {
          headers: {
            ...cursorHeaders(this.getConfig().apiKey),
            Accept: 'text/event-stream',
          },
          signal: controller.signal,
        },
      );

      if (response.status === 410) {
        throw new Error('Cursor stream expired — falling back to polling.');
      }

      if (!response.ok) {
        const body = await response.text();
        const mapped = mapCursorHttpError(response.status, body);
        throw new Error(mapped.message);
      }

      if (!response.body) {
        throw new Error('Cursor stream returned no body.');
      }

      return await this.readCursorSse(response.body, requestId, onChunk);
    } finally {
      clearTimeout(timeoutId);
    }
  }

  private async readCursorSse(
    body: ReadableStream<Uint8Array>,
    requestId: string,
    onChunk: (chunk: StreamChunk) => void,
  ): Promise<string> {
    const reader = body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';
    let content = '';
    let currentEvent = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) {
        break;
      }

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() ?? '';

      for (const line of lines) {
        if (line.startsWith('event:')) {
          currentEvent = line.slice(6).trim();
          continue;
        }

        if (!line.startsWith('data:')) {
          continue;
        }

        const payload = line.slice(5).trim();
        if (!payload) {
          continue;
        }

        const data = this.parseJsonSafe<Record<string, unknown>>(payload);
        if (!data) {
          continue;
        }

        if (currentEvent === 'assistant') {
          const text = typeof data.text === 'string' ? data.text : '';
          if (text) {
            content += text;
            onChunk({ id: requestId, delta: text, done: false });
          }
        }

        if (currentEvent === 'result') {
          const text = typeof data.text === 'string' ? data.text : '';
          if (text) {
            if (!content || text.length > content.length) {
              const delta = text.startsWith(content) ? text.slice(content.length) : text;
              if (delta) {
                onChunk({ id: requestId, delta, done: false });
              }
              content = text;
            }
          }
        }

        if (currentEvent === 'error') {
          const message =
            typeof data.message === 'string' ? data.message : 'Cursor stream error';
          throw new Error(message);
        }

        if (currentEvent === 'done') {
          onChunk({ id: requestId, delta: '', done: true, finishReason: 'stop' });
        }
      }
    }

    return content;
  }

  private async archiveAgent(agentId: string): Promise<void> {
    try {
      await fetch(`${CURSOR_API}/v1/agents/${agentId}/archive`, {
        method: 'POST',
        headers: cursorHeaders(this.getConfig().apiKey),
      });
    } catch {
      // Best-effort cleanup; ignore archive failures.
    }
  }
}
