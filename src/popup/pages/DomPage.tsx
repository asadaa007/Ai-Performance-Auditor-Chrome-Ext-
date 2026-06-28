import { PageShell } from '@popup/components/PageShell';
import { DomOverview, TopElements } from '@popup/widgets/DomWidgets';

export function DomPage() {
  return (
    <PageShell title="DOM" description="Document structure and element distribution">
      {(result) => (
        <div className="space-y-6">
          <DomOverview result={result} />
          <TopElements result={result} />
        </div>
      )}
    </PageShell>
  );
}
