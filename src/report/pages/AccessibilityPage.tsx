import { AccessibilityIssues } from '@popup/widgets/AccessibilityWidgets';
import { IssueFilters } from '@report/components/IssueFilters';
import { VirtualIssueList } from '@report/components/IssueCard';
import { ReportPageShell } from '@report/components/ReportPageShell';
import { useFilteredIssues } from '@report/navigation/routes';
import { useSnapshotData } from '@report/hooks/useSnapshotData';
import { useMemo } from 'react';
import type { AuditResult } from '@shared/types';

export function AccessibilityPage() {
  return (
    <ReportPageShell title="Accessibility" description="Collected accessibility signals and issues">
      {(result) => <AccessibilityContent result={result} />}
    </ReportPageShell>
  );
}

function AccessibilityContent({ result }: { result: AuditResult }) {
  const { analysis } = useSnapshotData();
  const baseIssues = useMemo(
    () => analysis?.issues.filter((issue) => issue.category === 'Accessibility') ?? [],
    [analysis],
  );
  const issues = useFilteredIssues(baseIssues);

  return (
    <div className="space-y-6">
      <AccessibilityIssues result={result} />
      <IssueFilters />
      <VirtualIssueList issues={issues} />
    </div>
  );
}
