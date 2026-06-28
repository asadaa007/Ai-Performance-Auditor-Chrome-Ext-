import { PageShell } from '@popup/components/PageShell';
import { AccessibilityIssues } from '@popup/widgets/AccessibilityWidgets';

export function AccessibilityPage() {
  return (
    <PageShell title="Accessibility" description="Collected accessibility signals and issues">
      {(result) => <AccessibilityIssues result={result} />}
    </PageShell>
  );
}
