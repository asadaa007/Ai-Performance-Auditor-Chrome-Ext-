import { PageShell } from '@popup/components/PageShell';
import { useEnterpriseAudit } from '@popup/hooks/useEnterpriseAudit';
import { useEnterpriseScore } from '@popup/hooks/useEnterpriseScore';
import { useAnalysis } from '@popup/hooks/useAnalysis';
import { useFixPlan } from '@popup/hooks/useFixPlan';
import { useScore } from '@popup/hooks/useScore';
import {
  OverviewStats,
  VitalsValidationPanel,
  WebVitalsGrid,
} from '@popup/widgets/DashboardWidgets';
import {
  CategoryBreakdownPanel,
  DeveloperModePanel,
  EnterpriseAuditCoveragePanel,
  LighthouseComparisonPanel,
  PassedChecksPanel,
  RuleInventoryPanel,
  UnsupportedAuditsPanel,
} from '@popup/widgets/EnterpriseDashboardWidgets';
import { useAuditStore } from '@popup/store/auditStore';
import { IssuesSummaryPanel } from '@popup/widgets/IssuesSummaryPanel';
import { ScoreBreakdownPanel } from '@popup/widgets/ScoreBreakdownPanel';
import { TopOpportunitiesPanel } from '@popup/widgets/TopOpportunitiesPanel';
import { WebsiteHealthPanel } from '@popup/widgets/WebsiteHealthPanel';
import { StatusPill } from '@shared/components';
import type { AuditResult } from '@shared/types';
import { formatTimestamp } from '@shared/utils';

function DashboardContent({ result }: { result: AuditResult }) {
  const analysis = useAnalysis(result);
  const fixPlan = useFixPlan(result, analysis);
  const score = useScore(analysis);
  const enterpriseReport = useEnterpriseAudit(result);
  const enterpriseScore = useEnterpriseScore(enterpriseReport);
  const auditId = useAuditStore((state) => state.auditId);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <StatusPill label={`Collected ${formatTimestamp(result.meta.collectedAt)}`} tone="accent" />
        <StatusPill label={result.meta.documentReadyState ?? 'unknown'} tone="neutral" />
      </div>

      <WebsiteHealthPanel enterpriseScore={enterpriseScore} score={score} />
      {enterpriseReport && enterpriseScore && (
        <>
          <EnterpriseAuditCoveragePanel report={enterpriseReport} score={enterpriseScore} />
          <LighthouseComparisonPanel report={enterpriseReport} />
          <RuleInventoryPanel report={enterpriseReport} />
          <CategoryBreakdownPanel score={enterpriseScore} />
          <PassedChecksPanel report={enterpriseReport} />
          <UnsupportedAuditsPanel report={enterpriseReport} />
          <DeveloperModePanel report={enterpriseReport} />
        </>
      )}
      <IssuesSummaryPanel score={score} />
      <TopOpportunitiesPanel fixPlan={fixPlan} auditId={auditId ?? undefined} />
      <OverviewStats result={result} />
      <WebVitalsGrid result={result} />
      <VitalsValidationPanel result={result} />
      <ScoreBreakdownPanel score={score} />
    </div>
  );
}

export function DashboardPage() {
  return (
    <PageShell title="Dashboard" description="High-level view of the latest page audit">
      {(result) => <DashboardContent result={result} />}
    </PageShell>
  );
}
