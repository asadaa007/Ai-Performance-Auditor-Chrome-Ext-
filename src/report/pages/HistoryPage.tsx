import { useCallback, useEffect, useMemo, useState } from 'react';
import { getReportMessageBus } from '@report/messaging/reportBus';
import { ReportPageShell } from '@report/components/ReportPageShell';
import { getReportUrl } from '@shared/audit/openReportTab';
import { deleteAuditSnapshot, listAuditSnapshots } from '@shared/snapshots/loadSnapshot';
import type { AuditSnapshotSummary } from '@shared/snapshots';
import { Button, Card, EmptyState, Section, SkeletonGrid } from '@shared/components';
import { formatTimestamp } from '@shared/utils';

export function HistoryPage() {
  const [entries, setEntries] = useState<AuditSnapshotSummary[]>([]);
  const [compareIds, setCompareIds] = useState<[string | null, string | null]>([null, null]);
  const [isLoading, setIsLoading] = useState(true);

  const loadEntries = useCallback(async () => {
    setIsLoading(true);
    try {
      const snapshots = await listAuditSnapshots(getReportMessageBus());
      setEntries(snapshots);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadEntries();
  }, [loadEntries]);

  const [left, right] = compareIds;
  const leftEntry = useMemo(() => entries.find((e) => e.auditId === left), [entries, left]);
  const rightEntry = useMemo(() => entries.find((e) => e.auditId === right), [entries, right]);

  const removeSnapshot = async (auditId: string) => {
    await deleteAuditSnapshot(getReportMessageBus(), auditId);
    await loadEntries();
  };

  return (
    <ReportPageShell
      title="Scan history"
      description="Immutable audit snapshots stored locally"
      requireAudit={false}
    >
      <div className="space-y-6">
        <Section title="Recent snapshots">
          {isLoading ? (
            <SkeletonGrid count={4} />
          ) : entries.length === 0 ? (
            <EmptyState
              title="No snapshots yet"
              description="Run an audit from the popup to create your first immutable report snapshot."
              icon="↺"
            />
          ) : (
            <Card className="divide-y divide-auditor-border-subtle p-0">
              {entries.map((entry) => (
                <div
                  key={entry.auditId}
                  className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 text-xs"
                >
                  <div className="min-w-0">
                    <p className="truncate font-medium text-auditor-text">{entry.url}</p>
                    <p className="text-2xs text-auditor-muted">
                      {formatTimestamp(entry.timestamp)} · {entry.issueCount} issues · score{' '}
                      {entry.overallScore ?? '—'}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => void chrome.tabs.create({ url: getReportUrl(entry.auditId) })}
                    >
                      Open
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setCompareIds([entry.auditId, right])}
                    >
                      Compare A
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setCompareIds([left, entry.auditId])}
                    >
                      Compare B
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => void removeSnapshot(entry.auditId)}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              ))}
            </Card>
          )}
        </Section>

        {(leftEntry || rightEntry) && (
          <Section title="Compare snapshots">
            <div className="grid gap-4 md:grid-cols-2">
              <CompareCard label="Snapshot A" entry={leftEntry} />
              <CompareCard label="Snapshot B" entry={rightEntry} />
            </div>
          </Section>
        )}
      </div>
    </ReportPageShell>
  );
}

function CompareCard({
  label,
  entry,
}: {
  label: string;
  entry: AuditSnapshotSummary | undefined;
}) {
  if (!entry) {
    return (
      <Card className="text-xs text-auditor-muted">
        <p className="font-medium text-auditor-text">{label}</p>
        <p className="mt-2">Select a snapshot</p>
      </Card>
    );
  }

  return (
    <Card className="text-xs">
      <p className="font-medium text-auditor-text">{label}</p>
      <p className="mt-2 truncate text-auditor-muted">{entry.url}</p>
      <p className="mt-2">Score: {entry.overallScore ?? '—'}</p>
      <p>Issues: {entry.issueCount}</p>
      <p className="text-2xs text-auditor-muted">{formatTimestamp(entry.timestamp)}</p>
    </Card>
  );
}
