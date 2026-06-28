import { useCallback, useEffect, useState } from 'react';
import type { AiConfigDiagnostics } from '@features/ai';
import { getPopupMessageBus } from '@popup/messaging/popupBus';
import {
  auditErrorFromSerialized,
  isErrorResponse,
  type SerializedAuditError,
} from '@shared/errors';
import type { GetAiDebugInfoResponsePayload } from '@shared/messaging';
import { Badge, Button, Card, Section, Skeleton } from '@shared/components';
import { formatTimestamp } from '@shared/utils';

function unwrapRpcResponse<T>(response: T | { error: SerializedAuditError }): T {
  if (isErrorResponse(response)) {
    throw auditErrorFromSerialized(response.error);
  }
  return response;
}

export function AiDebugPanel() {
  const [diagnostics, setDiagnostics] = useState<AiConfigDiagnostics | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<'unknown' | 'connected' | 'error'>(
    'unknown',
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = unwrapRpcResponse(
        await getPopupMessageBus().send<
          Record<string, never>,
          GetAiDebugInfoResponsePayload | { error: SerializedAuditError }
        >({
          type: 'GET_AI_DEBUG_INFO',
          payload: {},
          target: 'background',
        }),
      );

      setDiagnostics(response.diagnostics);
      setConnectionStatus(response.connectionStatus);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : String(caught));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  if (isLoading) {
    return (
      <Section title="AI debug">
        <Skeleton className="h-40" />
      </Section>
    );
  }

  if (error || !diagnostics) {
    return (
      <Section title="AI debug">
        <Card className="text-xs text-auditor-danger">{error ?? 'Diagnostics unavailable.'}</Card>
      </Section>
    );
  }

  return (
    <Section
      title="AI debug"
      description="Background storage and connection diagnostics (no secrets exposed)"
    >
      <Card className="space-y-3 text-xs">
        <DebugRow label="Provider" value={diagnostics.provider} />
        <DebugRow label="Model" value={diagnostics.model} />
        <DebugRow label="Has API key" value={diagnostics.hasApiKey ? 'yes' : 'no'} />
        <DebugRow label="API key length" value={String(diagnostics.apiKeyLength)} />
        <DebugRow label="Storage key" value={diagnostics.storageKey} />
        <DebugRow label="Storage status" value={diagnostics.storageStatus} />
        <DebugRow
          label="Connection status"
          value={connectionStatus}
          badge={
            connectionStatus === 'connected'
              ? 'success'
              : connectionStatus === 'error'
                ? 'danger'
                : 'neutral'
          }
        />
        <DebugRow
          label="Config updated"
          value={diagnostics.updatedAt ? formatTimestamp(diagnostics.updatedAt) : 'never'}
        />
        {diagnostics.lastTest ? (
          <>
            <DebugRow
              label="Last test result"
              value={diagnostics.lastTest.healthy ? 'Connected' : 'Error'}
              badge={diagnostics.lastTest.healthy ? 'success' : 'danger'}
            />
            <DebugRow label="Last test latency" value={`${diagnostics.lastTest.latencyMs} ms`} />
            <DebugRow
              label="Last test time"
              value={formatTimestamp(diagnostics.lastTest.testedAt)}
            />
            <p className="rounded-lg border border-auditor-border-subtle bg-auditor-bg-elevated p-2 text-2xs text-auditor-muted">
              {diagnostics.lastTest.message}
            </p>
          </>
        ) : (
          <DebugRow label="Last test result" value="none" />
        )}

        <Button size="sm" variant="secondary" onClick={() => void load()}>
          Refresh diagnostics
        </Button>
      </Card>
    </Section>
  );
}

function DebugRow({
  label,
  value,
  badge,
}: {
  label: string;
  value: string;
  badge?: 'success' | 'danger' | 'neutral';
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-auditor-muted">{label}</span>
      <div className="flex items-center gap-2">
        {badge && <Badge tone={badge}>{value}</Badge>}
        {!badge && <span className="font-mono text-auditor-text-secondary">{value}</span>}
      </div>
    </div>
  );
}
