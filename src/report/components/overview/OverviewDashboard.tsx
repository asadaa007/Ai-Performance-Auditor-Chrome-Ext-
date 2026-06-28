import { DeveloperModePanel } from '@popup/widgets/EnterpriseDashboardWidgets';
import type { EnterpriseAuditReport } from '@features/enterprise-audit';
import type { AuditResult } from '@shared/types';
import { VitalsValidationPanel } from '@popup/widgets/DashboardWidgets';
import { AccordionItem, Badge, Card } from '@shared/components';
import { useSnapshotData } from '@report/hooks/useSnapshotData';
import { CriticalIssuesStrip } from '@report/components/overview/CriticalIssuesStrip';
import { CategoryMapGrid } from '@report/components/overview/CategoryMapGrid';
import { CoverageBoard } from '@report/components/overview/CoverageBoard';
import { OverviewHeroBand } from '@report/components/overview/OverviewHeroBand';
import { QuickWinsBoard } from '@report/components/overview/QuickWinsBoard';
import { SeverityBreakdown } from '@report/components/overview/SeverityBreakdown';
import { TechnicalSnapshot } from '@report/components/overview/TechnicalSnapshot';
import { VitalsStrip } from '@report/components/overview/VitalsStrip';

interface OverviewDashboardProps {
  result: AuditResult;
}

export function OverviewDashboard({ result }: OverviewDashboardProps) {
  const {
    score,
    enterpriseReport,
    enterpriseScore,
    fixPlan,
    auditId,
    analysis,
  } = useSnapshotData();

  return (
    <div className="w-full space-y-10 pb-12">
      <header className="space-y-1">
        <h1 className="text-xl font-semibold tracking-tight text-auditor-text">Report overview</h1>
        <p className="text-sm text-auditor-muted">
          Executive summary, priorities, and evidence — drill into sidebar sections for full detail
        </p>
      </header>

      <OverviewHeroBand
        url={result.meta.url}
        collectedAt={result.meta.collectedAt}
        enterpriseScore={enterpriseScore}
        score={score}
        analysis={analysis}
        enterpriseReport={enterpriseReport}
      />

      <div className="space-y-10">
        <SeverityBreakdown analysis={analysis} score={score} />
        <CategoryMapGrid enterpriseScore={enterpriseScore} analysis={analysis} />
        <CriticalIssuesStrip issues={analysis?.issues ?? []} />
        <QuickWinsBoard fixPlan={fixPlan} auditId={auditId ?? undefined} />
      </div>

      <VitalsStrip result={result} />

      {enterpriseReport && enterpriseScore && (
        <CoverageBoard report={enterpriseReport} score={enterpriseScore} />
      )}

      <TechnicalSnapshot result={result} fixPlan={fixPlan} />

      {enterpriseReport && (
        <div className="grid gap-4 lg:grid-cols-2">
          <EnterpriseChecksCard report={enterpriseReport} variant="passed" />
          <EnterpriseChecksCard report={enterpriseReport} variant="unsupported" />
          <div className="rounded-xl border border-auditor-border-subtle bg-auditor-surface/40 lg:col-span-2">
            <AccordionItem title="Developer diagnostics" defaultOpen={false}>
              <div className="px-1 pb-2">
                <DeveloperModePanel report={enterpriseReport} />
              </div>
            </AccordionItem>
          </div>
        </div>
      )}

      <VitalsValidationPanel result={result} />
    </div>
  );
}

function EnterpriseChecksCard({
  report,
  variant,
}: {
  report: EnterpriseAuditReport;
  variant: 'passed' | 'unsupported';
}) {
  const items =
    variant === 'passed'
      ? report.results.filter((r) => r.status === 'pass')
      : report.results.filter((r) => r.status === 'unsupported');

  return (
    <Card variant="elevated" className="flex max-h-64 flex-col">
      <div className="mb-3 flex items-center justify-between border-b border-auditor-border-subtle pb-3">
        <p className="text-sm font-semibold text-auditor-text">
          {variant === 'passed' ? 'Passed checks' : 'Unsupported audits'}
        </p>
        <Badge tone={variant === 'passed' ? 'success' : 'neutral'}>{items.length}</Badge>
      </div>
      <ul className="flex-1 space-y-2 overflow-y-auto text-2xs">
        {items.length === 0 ? (
          <li className="text-auditor-muted">None in this snapshot.</li>
        ) : (
          items.slice(0, 24).map((audit) => (
            <li
              key={audit.id}
              className="rounded-lg border border-auditor-border-subtle/60 bg-auditor-bg-elevated/40 px-2 py-1.5"
            >
              <p className="font-medium text-auditor-text-secondary">{audit.title}</p>
              {variant === 'unsupported' && audit.unsupportedReason && (
                <p className="mt-0.5 text-auditor-muted">{audit.unsupportedReason}</p>
              )}
            </li>
          ))
        )}
      </ul>
    </Card>
  );
}
