import type { EnterpriseAuditReport } from '@features/enterprise-audit';
import type { EnterpriseScoreResult } from '@features/enterprise-audit';
import { Card } from '@shared/components';
import { NavIcon } from '@shared/components/NavIcon';
import { DashboardSection } from '@report/components/overview/DashboardSection';

interface CoverageBoardProps {
  report: EnterpriseAuditReport;
  score: EnterpriseScoreResult;
}

function CoverageTile({
  icon,
  label,
  value,
  unit,
  hint,
}: {
  icon: 'checked' | 'alert' | 'chart' | 'shield';
  label: string;
  value: string;
  unit?: string;
  hint: string;
}) {
  return (
    <Card variant="elevated" padding="sm" className="flex gap-3">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-auditor-bg-elevated">
        <NavIcon name={icon} size={18} className="text-auditor-accent" />
      </div>
      <div className="min-w-0">
        <p className="text-3xs uppercase tracking-wider text-auditor-muted">{label}</p>
        <p className="mt-0.5 text-xl font-bold tabular-nums text-auditor-text">
          {value}
          {unit && <span className="ml-0.5 text-sm font-normal text-auditor-muted">{unit}</span>}
        </p>
        <p className="mt-1 text-3xs leading-relaxed text-auditor-muted">{hint}</p>
      </div>
    </Card>
  );
}

export function CoverageBoard({ report, score }: CoverageBoardProps) {
  const executed =
    report.summary.passed +
    report.summary.failed +
    report.summary.skipped +
    report.summary.partial;

  return (
    <DashboardSection
      icon="shield"
      title="Enterprise audit coverage"
      subtitle="Lighthouse-compatible inventory — what ran, what passed, and what needs privileged APIs"
    >
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-6">
        <CoverageTile
          icon="chart"
          label="Coverage"
          value={String(report.summary.coveragePercent)}
          unit="%"
          hint="Share of audit inventory implemented"
        />
        <CoverageTile
          icon="shield"
          label="Confidence"
          value={String(Math.round(score.confidenceScore * 100))}
          unit="%"
          hint="Measurement confidence across audits"
        />
        <CoverageTile
          icon="checked"
          label="Passed"
          value={String(report.summary.passed)}
          hint="Rules that passed on this page"
        />
        <CoverageTile
          icon="alert"
          label="Failed"
          value={String(report.summary.failed)}
          hint="Rules that failed — see category sections"
        />
        <CoverageTile
          icon="chart"
          label="Unsupported"
          value={String(report.summary.unsupported)}
          hint="Require CDP or privileged browser APIs"
        />
        <CoverageTile
          icon="checked"
          label="Executed"
          value={String(executed)}
          hint="Audits actually run in this snapshot"
        />
      </div>
    </DashboardSection>
  );
}
