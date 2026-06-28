import { DeveloperModePanel, RuleInventoryPanel } from '@popup/widgets/EnterpriseDashboardWidgets';
import { ReportPageShell } from '@report/components/ReportPageShell';
import { useSnapshotData } from '@report/hooks/useSnapshotData';

function DeveloperContent() {
  const { enterpriseReport } = useSnapshotData();
  if (!enterpriseReport) {
    return null;
  }

  return (
    <div className="space-y-6">
      <DeveloperModePanel report={enterpriseReport} />
      <RuleInventoryPanel report={enterpriseReport} />
    </div>
  );
}

export function DeveloperPage() {
  return (
    <ReportPageShell
      title="Developer Mode"
      description="Full audit inventory, rule status, and diagnostic detail"
    >
      {() => <DeveloperContent />}
    </ReportPageShell>
  );
}
