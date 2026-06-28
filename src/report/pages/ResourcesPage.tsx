import { ResourcesExplorer } from '@popup/widgets/ResourcesWidgets';
import { ReportPageShell } from '@report/components/ReportPageShell';

export function ResourcesPage() {
  return (
    <ReportPageShell title="Resources" description="Network requests, duplicates, and slow assets">
      {(result) => <ResourcesExplorer result={result} />}
    </ReportPageShell>
  );
}
