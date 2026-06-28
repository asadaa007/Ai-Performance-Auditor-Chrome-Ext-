import { PageShell } from '@popup/components/PageShell';
import { ResourcesExplorer } from '@popup/widgets/ResourcesWidgets';

export function ResourcesPage() {
  return (
    <PageShell title="Resources" description="Network requests, duplicates, and slow assets">
      {(result) => <ResourcesExplorer result={result} />}
    </PageShell>
  );
}
