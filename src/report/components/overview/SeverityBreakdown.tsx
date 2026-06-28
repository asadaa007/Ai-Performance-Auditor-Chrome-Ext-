import type { AnalysisResult } from '@features/analysis';
import type { ScoreResult } from '@features/scoring';
import { Card } from '@shared/components';
import { DashboardSection } from '@report/components/overview/DashboardSection';

interface SeverityBreakdownProps {
  analysis: AnalysisResult | null;
  score: ScoreResult | null;
}

const SEVERITY_ORDER = ['Critical', 'High', 'Medium', 'Low', 'Info'] as const;

const SEVERITY_COLORS: Record<(typeof SEVERITY_ORDER)[number], string> = {
  Critical: 'bg-auditor-danger',
  High: 'bg-auditor-warning',
  Medium: 'bg-auditor-accent',
  Low: 'bg-auditor-muted',
  Info: 'bg-auditor-border',
};

export function SeverityBreakdown({ analysis, score }: SeverityBreakdownProps) {
  const bySeverity = analysis?.bySeverity ?? {};
  const total = analysis?.issueCount ?? 0;

  const segments = SEVERITY_ORDER.map((severity) => ({
    severity,
    count: bySeverity[severity] ?? 0,
  })).filter((s) => s.count > 0);

  const passed = score?.passedCount ?? 0;
  const potential = score?.estimatedImprovementPotential ?? 0;

  return (
    <DashboardSection
      icon="alert"
      title="Findings at a glance"
      subtitle="Severity distribution and recoverable score from rule analysis"
    >
      <div className="grid gap-4 lg:grid-cols-2">
        <Card variant="elevated" className="space-y-4">
          <div className="flex h-3 overflow-hidden rounded-full bg-auditor-bg-elevated">
            {total === 0 ? (
              <div className="h-full w-full bg-auditor-success/40" title="No issues" />
            ) : (
              segments.map((segment) => (
                <div
                  key={segment.severity}
                  className={`h-full ${SEVERITY_COLORS[segment.severity]}`}
                  style={{ width: `${(segment.count / total) * 100}%` }}
                  title={`${segment.severity}: ${segment.count}`}
                />
              ))
            )}
          </div>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {SEVERITY_ORDER.map((severity) => {
              const count = bySeverity[severity] ?? 0;
              if (count === 0 && total > 0) return null;
              return (
                <div
                  key={severity}
                  className="rounded-lg border border-auditor-border-subtle bg-auditor-bg-elevated/50 px-3 py-2"
                >
                  <div className="flex items-center gap-2">
                    <span className={`h-2 w-2 rounded-full ${SEVERITY_COLORS[severity]}`} />
                    <span className="text-3xs text-auditor-muted">{severity}</span>
                  </div>
                  <p className="mt-1 text-lg font-semibold tabular-nums text-auditor-text">{count}</p>
                </div>
              );
            })}
            {total === 0 && (
              <p className="col-span-full text-xs text-auditor-success">No open findings in this audit.</p>
            )}
          </div>
        </Card>

        <div className="grid grid-cols-2 gap-3">
          <Card variant="elevated" padding="sm" className="flex flex-col justify-center">
            <p className="text-3xs uppercase tracking-wider text-auditor-muted">Passed checks</p>
            <p className="mt-1 text-2xl font-bold tabular-nums text-auditor-success">{passed}</p>
          </Card>
          <Card variant="elevated" padding="sm" className="flex flex-col justify-center">
            <p className="text-3xs uppercase tracking-wider text-auditor-muted">Recoverable pts</p>
            <p className="mt-1 text-2xl font-bold tabular-nums text-auditor-accent">+{potential}</p>
          </Card>
          <Card variant="elevated" padding="sm" className="col-span-2">
            <p className="text-3xs uppercase tracking-wider text-auditor-muted">Rules executed</p>
            <p className="mt-1 text-2xl font-bold tabular-nums text-auditor-text">
              {analysis?.rulesExecuted ?? '—'}
            </p>
            <p className="mt-1 text-2xs text-auditor-muted">
              Analysis engine rules evaluated against collected audit data
            </p>
          </Card>
        </div>
      </div>
    </DashboardSection>
  );
}
