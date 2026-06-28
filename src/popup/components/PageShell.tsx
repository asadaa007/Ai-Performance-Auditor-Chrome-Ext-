import { useAudit } from '@popup/hooks/useAudit';
import { useAuditData } from '@popup/hooks/useAuditData';
import { Button, EmptyState, ErrorState, LoadingOverlay, SkeletonGrid } from '@shared/components';
import type { ReactNode } from 'react';

interface PageShellProps {
  title: string;
  description?: string;
  children:
    | ReactNode
    | ((result: NonNullable<ReturnType<typeof useAuditData>['result']>) => ReactNode);
  requireAudit?: boolean;
}

export function PageShell({ title, description, children, requireAudit = true }: PageShellProps) {
  const { result, hasAudit, isCollecting, isFailed, isHydrated, error, progress } = useAuditData();
  const { startAudit } = useAudit();

  return (
    <div className="relative space-y-4">
      <header>
        <h1 className="text-base font-semibold tracking-tight text-auditor-text">{title}</h1>
        {description && <p className="mt-0.5 text-xs text-auditor-muted">{description}</p>}
      </header>

      {!isHydrated && <SkeletonGrid count={6} />}

      {isHydrated && isFailed && error && (
        <ErrorState message={error.message} onRetry={() => void startAudit()} />
      )}

      {isHydrated && requireAudit && !hasAudit && !isCollecting && !isFailed && (
        <EmptyState
          title="No audit data"
          description="Run an audit from the header to populate this view with live page metrics."
          action={
            <Button size="sm" onClick={() => void startAudit()}>
              Analyze page
            </Button>
          }
          icon="◎"
        />
      )}

      {isHydrated && (!requireAudit || hasAudit) && (
        <div className="relative">
          <LoadingOverlay
            visible={isCollecting}
            label="Collecting audit data…"
            progress={progress}
          />
          {typeof children === 'function'
            ? hasAudit && result
              ? children(result)
              : null
            : children}
        </div>
      )}
    </div>
  );
}
