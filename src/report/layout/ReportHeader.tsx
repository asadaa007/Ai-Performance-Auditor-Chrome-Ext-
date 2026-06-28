import { useSnapshotData } from '@report/hooks/useSnapshotData';
import { exportAuditJson, exportAuditMarkdown, exportAuditPdf } from '@report/utils/export';
import { useReportUiStore } from '@report/store/uiStore';
import { Button, ExtensionLogo } from '@shared/components';
import { NavIcon } from '@shared/components/NavIcon';
import { getCommandKeyLabel } from '@shared/utils/platform';
import { formatTimestamp, formatUrl } from '@shared/utils';

function scoreTone(value: number): string {
  if (value >= 90) return 'text-auditor-success';
  if (value >= 50) return 'text-auditor-warning';
  return 'text-auditor-danger';
}

export function ReportHeader() {
  const { result, analysis, enterpriseScore, url, timestamp, auditId } = useSnapshotData();
  const setCommandPaletteOpen = useReportUiStore((s) => s.setCommandPaletteOpen);
  const displayScore = enterpriseScore?.overallScore ?? null;
  const shortcut = getCommandKeyLabel();

  return (
    <header className="report-nav shrink-0 border-b border-auditor-border-subtle bg-auditor-bg-elevated/80 backdrop-blur-glass">
      <div className="flex flex-wrap items-center justify-between gap-4 px-5 py-3 lg:px-8">
        <div className="flex min-w-0 flex-1 items-center gap-4">
          <ExtensionLogo size={40} />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-sm font-semibold tracking-tight text-auditor-text">
                Performance Report
              </p>
              {displayScore !== null && (
                <span
                  className={`rounded-md bg-auditor-surface px-2 py-0.5 font-mono text-xs font-semibold tabular-nums ${scoreTone(displayScore)}`}
                >
                  {displayScore}
                </span>
              )}
            </div>
            <p className="truncate font-mono text-2xs text-auditor-muted">
              {formatUrl(url ?? result?.meta.url ?? '', 72)}
            </p>
            {timestamp && (
              <p className="text-3xs text-auditor-muted">
                {formatTimestamp(timestamp)}
                {auditId && (
                  <span className="ml-2 font-mono opacity-50">#{auditId.slice(0, 8)}</span>
                )}
              </p>
            )}
          </div>
        </div>

        <div className="report-no-print flex flex-wrap items-center gap-2">
          <Button
            size="sm"
            variant="secondary"
            onClick={() => setCommandPaletteOpen(true)}
            aria-label={`Open command palette (${shortcut})`}
          >
            <NavIcon name="dashboard" size={14} />
            {shortcut}
          </Button>
          {result && analysis && (
            <>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => exportAuditJson(result, analysis)}
                aria-label="Export audit as JSON"
              >
                JSON
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => exportAuditMarkdown(result, analysis)}
                aria-label="Export audit as Markdown"
              >
                MD
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => exportAuditPdf()}
                aria-label="Export audit as PDF"
              >
                PDF
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
