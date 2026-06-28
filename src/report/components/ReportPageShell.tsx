import { useSnapshotData } from '@report/hooks/useSnapshotData';
import { EmptyState, SkeletonGrid } from '@shared/components';
import type { AuditResult } from '@shared/types';
import type { ReactNode } from 'react';

interface ReportPageShellProps {
  title: string;
  description?: string;
  children: ReactNode | ((result: AuditResult) => ReactNode);
  requireAudit?: boolean;
}

export function ReportPageShell({
  title,
  description,
  children,
  requireAudit = true,
}: ReportPageShellProps) {
  const { result, hasSnapshot, isLoading } = useSnapshotData();

  return (
    <article className="report-print-area w-full space-y-8">
      <header className="space-y-2 border-b border-auditor-border-subtle pb-6">
        <h1 className="text-xl font-semibold tracking-tight text-auditor-text">{title}</h1>
        {description && <p className="max-w-2xl text-sm leading-relaxed text-auditor-muted">{description}</p>}
      </header>

      {isLoading && <SkeletonGrid count={6} />}

      {!isLoading && requireAudit && !hasSnapshot && (
        <EmptyState
          title="Snapshot unavailable"
          description="This report could not load its immutable audit snapshot."
          icon="◎"
        />
      )}

      {!isLoading && (!requireAudit || hasSnapshot) && (
        <div className="relative space-y-8">
          {typeof children === 'function'
            ? hasSnapshot && result
              ? children(result)
              : null
            : children}
        </div>
      )}
    </article>
  );
}
