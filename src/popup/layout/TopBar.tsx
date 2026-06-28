import { useAudit, useAuditProgress, useAuditStatus } from '@popup/hooks';
import { navigateTo } from '@popup/navigation/navigate';
import { useAuditData } from '@popup/hooks/useAuditData';
import { Button, ProgressBar, StatusPill, Tooltip } from '@shared/components';
import { formatUrl } from '@shared/utils';

export function TopBar() {
  const { url, isCollecting } = useAuditData();
  const { startAudit } = useAudit();
  const { isFailed } = useAuditStatus();
  const { progress, currentCollector } = useAuditProgress();

  return (
    <header className="flex h-13 shrink-0 items-center gap-3 border-b border-auditor-border-subtle bg-auditor-bg-elevated/80 px-4 backdrop-blur-glass">
      <div className="min-w-0 flex-1">
        <p className="text-2xs uppercase tracking-wider text-auditor-muted">Current page</p>
        <Tooltip content={url ?? 'No active URL'}>
          <p className="truncate font-mono text-xs text-auditor-text-secondary">
            {formatUrl(url, 64)}
          </p>
        </Tooltip>
      </div>

      {isCollecting && (
        <div className="hidden w-36 sm:block">
          <ProgressBar value={progress} label={currentCollector ?? 'Collecting'} size="sm" />
        </div>
      )}

      <StatusPill
        label={isCollecting ? 'Analyzing' : isFailed ? 'Failed' : 'Ready'}
        tone={isCollecting ? 'accent' : isFailed ? 'danger' : 'success'}
      />

      <div className="flex items-center gap-1.5">
        <Button size="sm" onClick={() => void startAudit()} disabled={isCollecting}>
          {isCollecting ? 'Analyzing…' : 'Analyze'}
        </Button>
        <Button
          size="sm"
          variant="secondary"
          onClick={() => void startAudit()}
          disabled={isCollecting}
        >
          Refresh
        </Button>
        <Tooltip content="Export coming in a future release">
          <Button size="sm" variant="ghost" disabled>
            Export
          </Button>
        </Tooltip>
        <Button size="sm" variant="ghost" onClick={() => navigateTo('settings')}>
          Settings
        </Button>
      </div>
    </header>
  );
}
