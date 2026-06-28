import { useCallback, useEffect, useRef, useState } from 'react';
import type { FixAction, FixGroup } from '@features/fix-planner';
import { extractPrimaryCodeBlock } from '@features/ai-explain';
import { mapAIError, type FriendlyAIError } from '@features/ai';
import { AiErrorDisplay } from '@popup/components/AiErrorDisplay';
import { MarkdownRenderer } from '@popup/components/MarkdownRenderer';
import { getPopupMessageBus } from '@popup/messaging/popupBus';
import { getReportMessageBus } from '@report/messaging/reportBus';
import { useAuditStore } from '@popup/store/auditStore';
import {
  auditErrorFromSerialized,
  isErrorResponse,
  type SerializedAuditError,
} from '@shared/errors';
import type {
  AiExplainChunkPayload,
  AiExplainDonePayload,
  AiExplainErrorPayload,
  ExplainFixPayload,
  ExplainFixResponsePayload,
} from '@shared/messaging';
import { Badge, Button, Modal, StatusPill } from '@shared/components';
import { connectServiceWorkerKeepAlive } from '@shared/utils/serviceWorkerKeepAlive';

interface ExplainFixPanelProps {
  group: FixGroup;
  action: FixAction;
  open: boolean;
  onClose: () => void;
  auditId?: string;
}

function unwrapRpcResponse<T>(response: T | { error: SerializedAuditError }): T {
  if (isErrorResponse(response)) {
    throw auditErrorFromSerialized(response.error);
  }
  return response;
}

function getExplainMessageBus(resolvedAuditId?: string) {
  return resolvedAuditId ? getReportMessageBus() : getPopupMessageBus();
}

export function ExplainFixPanel({ group, action, open, onClose, auditId }: ExplainFixPanelProps) {
  const [status, setStatus] = useState<'idle' | 'streaming' | 'completed' | 'error' | 'cancelled'>(
    'idle',
  );
  const [content, setContent] = useState('');
  const [error, setError] = useState<FriendlyAIError | null>(null);
  const [cacheStatus, setCacheStatus] = useState<string | null>(null);
  const [latencyMs, setLatencyMs] = useState<number | null>(null);
  const requestIdRef = useRef<string | null>(null);
  const issueId = action.relatedIssues[0];

  const startExplain = useCallback(async () => {
    if (!issueId) {
      setError(mapAIError('This action is not linked to a performance issue.'));
      setStatus('error');
      return;
    }

    const storeState = useAuditStore.getState();
    const resolvedAuditId = auditId ?? storeState.auditId ?? undefined;
    const tabId = resolvedAuditId ? undefined : (storeState.tabId ?? undefined);
    const bus = getExplainMessageBus(resolvedAuditId);

    setStatus('streaming');
    setContent('');
    setError(null);
    setCacheStatus(null);
    setLatencyMs(null);

    try {
      const response = unwrapRpcResponse(
        await bus.send<
          ExplainFixPayload,
          ExplainFixResponsePayload | { error: SerializedAuditError }
        >({
          type: 'EXPLAIN_FIX',
          payload: {
            auditId: resolvedAuditId,
            tabId,
            groupId: group.id,
            actionId: action.id,
            issueId,
          },
          target: 'background',
        }),
      );

      requestIdRef.current = response.requestId;
    } catch (caught) {
      setError(mapAIError(caught instanceof Error ? caught.message : String(caught)));
      setStatus('error');
    }
  }, [action.id, auditId, group.id, issueId]);

  useEffect(() => {
    if (!open) {
      return;
    }

    const resolvedAuditId = auditId ?? useAuditStore.getState().auditId ?? undefined;
    const bus = getExplainMessageBus(resolvedAuditId);
    const releaseKeepAlive = connectServiceWorkerKeepAlive();

    const unsubscribeChunk = bus.on<AiExplainChunkPayload>('AI_EXPLAIN_CHUNK', async (message) => {
      if (message.payload.requestId !== requestIdRef.current) {
        return;
      }

      setContent((current) => current + message.payload.delta);
      if (message.payload.done) {
        if (message.payload.finishReason === 'cancelled') {
          setStatus('cancelled');
        } else {
          setStatus('completed');
        }
      }
    });

    const unsubscribeDone = bus.on<AiExplainDonePayload>('AI_EXPLAIN_DONE', async (message) => {
      if (message.payload.requestId !== requestIdRef.current) {
        return;
      }

      setStatus('completed');
      setCacheStatus(message.payload.cacheStatus);
      setLatencyMs(message.payload.latencyMs);
    });

    const unsubscribeError = bus.on<AiExplainErrorPayload>('AI_EXPLAIN_ERROR', async (message) => {
      if (message.payload.requestId !== requestIdRef.current) {
        return;
      }

      setError(
        mapAIError({
          message: message.payload.message,
          code: message.payload.code,
          retryable: message.payload.retryable,
        }),
      );
      setStatus('error');
    });

    return () => {
      releaseKeepAlive();
      unsubscribeChunk();
      unsubscribeDone();
      unsubscribeError();
    };
  }, [auditId, open]);

  useEffect(() => {
    if (!open) {
      setStatus('idle');
      setContent('');
      setError(null);
      requestIdRef.current = null;
    }
  }, [open]);

  const cancel = useCallback(async () => {
    const resolvedAuditId = auditId ?? useAuditStore.getState().auditId ?? undefined;
    const bus = getExplainMessageBus(resolvedAuditId);
    await bus.send({ type: 'CANCEL_AI_EXPLAIN', payload: {}, target: 'background' });
    setStatus('cancelled');
  }, [auditId]);

  const copyMarkdown = useCallback(async () => {
    await navigator.clipboard.writeText(content);
  }, [content]);

  const copyCode = useCallback(async () => {
    const code = extractPrimaryCodeBlock(content);
    if (code) {
      await navigator.clipboard.writeText(code);
    }
  }, [content]);

  return (
    <Modal open={open} title={action.title} onClose={onClose}>
      <div className="space-y-3">
        <div className="flex flex-wrap items-center gap-2 text-2xs">
          <Badge tone="accent">{group.framework}</Badge>
          <StatusPill label={`Group: ${group.title}`} tone="neutral" />
          <StatusPill label={`Impact: ${action.estimatedImpact}`} tone="warning" />
          <StatusPill label={`Effort: ${action.complexity}`} tone="neutral" />
        </div>

        <div className="flex flex-wrap gap-2">
          {status === 'idle' && (
            <Button size="sm" onClick={() => void startExplain()}>
              Explain & Fix
            </Button>
          )}
          {status === 'streaming' && (
            <>
              <Button size="sm" variant="secondary" disabled>
                Streaming…
              </Button>
              <Button size="sm" variant="ghost" onClick={() => void cancel()}>
                Cancel
              </Button>
            </>
          )}
          {(status === 'completed' || status === 'cancelled') && (
            <>
              <Button size="sm" onClick={() => void startExplain()}>
                Retry
              </Button>
              <Button
                size="sm"
                variant="secondary"
                onClick={() => void copyMarkdown()}
                disabled={!content}
              >
                Copy Markdown
              </Button>
              <Button
                size="sm"
                variant="secondary"
                onClick={() => void copyCode()}
                disabled={!content}
              >
                Copy Code
              </Button>
            </>
          )}
        </div>

        {cacheStatus && (
          <p className="text-2xs text-auditor-muted">
            Cache: {cacheStatus}
            {latencyMs !== null ? ` · ${latencyMs} ms` : ''}
          </p>
        )}

        {error && <AiErrorDisplay error={error} onRetry={() => void startExplain()} />}

        {content && (
          <div className="max-h-80 overflow-y-auto rounded-lg border border-auditor-border-subtle bg-auditor-surface p-3">
            <MarkdownRenderer content={content} />
          </div>
        )}

        {status === 'streaming' && !content && (
          <p className="text-xs text-auditor-muted">Waiting for model output…</p>
        )}
      </div>
    </Modal>
  );
}
