import { useCallback, useEffect, useRef, useState } from 'react';
import type { PerformanceIssue } from '@features/analysis';
import { ISSUE_DIRECT_GROUP_ID } from '@features/ai-explain/ExplainContextBuilder';
import { extractPrimaryCodeBlock } from '@features/ai-explain';
import { mapAIError, type FriendlyAIError } from '@features/ai';
import { AiErrorDisplay } from '@popup/components/AiErrorDisplay';
import { MarkdownRenderer } from '@popup/components/MarkdownRenderer';
import { getReportMessageBus } from '@report/messaging/reportBus';
import { useSnapshotData } from '@report/hooks/useSnapshotData';
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

interface ExplainIssuePanelProps {
  issue: PerformanceIssue;
  open: boolean;
  onClose: () => void;
}

function unwrapRpcResponse<T>(response: T | { error: SerializedAuditError }): T {
  if (isErrorResponse(response)) {
    throw auditErrorFromSerialized(response.error);
  }
  return response;
}

export function ExplainIssuePanel({ issue, open, onClose }: ExplainIssuePanelProps) {
  const { auditId } = useSnapshotData();
  const [status, setStatus] = useState<'idle' | 'streaming' | 'completed' | 'error' | 'cancelled'>(
    'idle',
  );
  const [content, setContent] = useState('');
  const [error, setError] = useState<FriendlyAIError | null>(null);
  const requestIdRef = useRef<string | null>(null);

  const startExplain = useCallback(async () => {
    const bus = getReportMessageBus();

    setStatus('streaming');
    setContent('');
    setError(null);

    try {
      const response = unwrapRpcResponse(
        await bus.send<
          ExplainFixPayload,
          ExplainFixResponsePayload | { error: SerializedAuditError }
        >({
          type: 'EXPLAIN_FIX',
          payload: {
            auditId: auditId ?? undefined,
            groupId: ISSUE_DIRECT_GROUP_ID,
            actionId: issue.id,
            issueId: issue.id,
          },
          target: 'background',
        }),
      );
      requestIdRef.current = response.requestId;
    } catch (caught) {
      setError(mapAIError(caught instanceof Error ? caught.message : 'Failed to start AI explanation.'));
      setStatus('error');
    }
  }, [issue.id, auditId]);

  useEffect(() => {
    if (!open) {
      return;
    }

    const bus = getReportMessageBus();
    const releaseKeepAlive = connectServiceWorkerKeepAlive();

    const unsubscribeChunk = bus.on<AiExplainChunkPayload>('AI_EXPLAIN_CHUNK', async (message) => {
      if (message.payload.requestId !== requestIdRef.current) {
        return;
      }
      setContent((current) => current + message.payload.delta);
      if (message.payload.done) {
        setStatus(message.payload.finishReason === 'cancelled' ? 'cancelled' : 'completed');
      }
    });

    const unsubscribeDone = bus.on<AiExplainDonePayload>('AI_EXPLAIN_DONE', async (message) => {
      if (message.payload.requestId !== requestIdRef.current) {
        return;
      }
      setStatus('completed');
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

    void startExplain();

    return () => {
      releaseKeepAlive();
      unsubscribeChunk();
      unsubscribeDone();
      unsubscribeError();
    };
  }, [open, startExplain]);

  useEffect(() => {
    if (!open) {
      setStatus('idle');
      setContent('');
      setError(null);
      requestIdRef.current = null;
    }
  }, [open]);

  const codeBlock = extractPrimaryCodeBlock(content);

  return (
    <Modal open={open} title={`Explain: ${issue.title}`} onClose={onClose}>
      <div className="space-y-3 text-xs">
        <div className="flex flex-wrap gap-2">
          <Badge tone="accent">{issue.category}</Badge>
          <StatusPill label={issue.severity} tone="warning" />
        </div>

        {status === 'streaming' && (
          <p className="text-auditor-muted">
            Connecting to Cursor cloud agent… This can take up to a minute.
          </p>
        )}
        {error && <AiErrorDisplay error={error} />}
        {content && <MarkdownRenderer content={content} />}
        {codeBlock && (
          <pre className="max-h-48 overflow-auto rounded-lg bg-auditor-bg-elevated p-3 font-mono text-2xs">
            {codeBlock}
          </pre>
        )}

        <div className="flex justify-end gap-2">
          {status === 'error' && (
            <Button size="sm" onClick={() => void startExplain()}>
              Retry
            </Button>
          )}
          <Button size="sm" variant="secondary" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </Modal>
  );
}
