import { useCallback, useEffect, useState } from 'react';
import { getReportMessageBus } from '@report/messaging/reportBus';
import { ReportPageShell } from '@report/components/ReportPageShell';
import type { ExplainHistoryEntry } from '@features/ai-explain';
import {
  auditErrorFromSerialized,
  isErrorResponse,
  type SerializedAuditError,
} from '@shared/errors';
import type { GetAiHistoryResponsePayload } from '@shared/messaging';
import { Badge, Card, EmptyState, Section, Skeleton } from '@shared/components';
import { formatTimestamp } from '@shared/utils';

function unwrapRpcResponse<T>(response: T | { error: SerializedAuditError }): T {
  if (isErrorResponse(response)) {
    throw auditErrorFromSerialized(response.error);
  }
  return response;
}

export function AiPage() {
  const [history, setHistory] = useState<ExplainHistoryEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadHistory = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = unwrapRpcResponse(
        await getReportMessageBus().send<
          Record<string, never>,
          GetAiHistoryResponsePayload | { error: SerializedAuditError }
        >({
          type: 'GET_AI_HISTORY',
          payload: {},
          target: 'background',
        }),
      );
      setHistory(response.history);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : String(caught));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadHistory();
  }, [loadHistory]);

  return (
    <ReportPageShell
      title="AI Assistant"
      description="Explain & Fix history and AI interaction cache"
      requireAudit={false}
    >
      <Section title="AI history" description="Recent Explain & Fix responses">
        {isLoading ? (
          <Skeleton className="h-32" />
        ) : error ? (
          <p className="text-xs text-auditor-danger">{error}</p>
        ) : history.length === 0 ? (
          <EmptyState
            title="No AI history yet"
            description="Use Explain with AI on an issue card to generate your first response."
            icon="✦"
          />
        ) : (
          <Card className="divide-y divide-auditor-border-subtle p-0">
            {history.map((entry) => (
              <div key={entry.id} className="space-y-2 px-3 py-3 text-xs">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-medium text-auditor-text">{entry.actionTitle}</p>
                  <Badge tone={entry.cacheStatus === 'hit' ? 'success' : 'accent'}>
                    {entry.cacheStatus}
                  </Badge>
                </div>
                <p className="text-auditor-muted">{entry.issueTitle}</p>
                <div className="flex flex-wrap gap-3 text-2xs text-auditor-muted">
                  <span>{formatTimestamp(entry.timestamp)}</span>
                  <span>{entry.provider}</span>
                  <span>{entry.model}</span>
                  <span>{entry.latencyMs} ms</span>
                </div>
                <p className="line-clamp-2 text-2xs text-auditor-muted-foreground">
                  {entry.contentPreview}
                </p>
              </div>
            ))}
          </Card>
        )}
      </Section>
    </ReportPageShell>
  );
}
