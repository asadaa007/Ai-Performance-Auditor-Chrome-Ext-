import { DomOverview, TopElements } from '@popup/widgets/DomWidgets';
import { ReportPageShell } from '@report/components/ReportPageShell';

export function DomPage() {
  return (
    <ReportPageShell title="DOM" description="Document structure and element distribution">
      {(result) => (
        <div className="space-y-6">
          <DomOverview result={result} />
          <TopElements result={result} />
        </div>
      )}
    </ReportPageShell>
  );
}
