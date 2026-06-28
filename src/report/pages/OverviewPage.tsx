import { OverviewDashboard } from '@report/components/overview/OverviewDashboard';
import { useSnapshotData } from '@report/hooks/useSnapshotData';
import { EmptyState, SkeletonGrid } from '@shared/components';

export function OverviewPage() {
  const { result, hasSnapshot, isLoading } = useSnapshotData();

  if (isLoading) {
    return <SkeletonGrid count={8} />;
  }

  if (!hasSnapshot || !result) {
    return (
      <EmptyState
        title="Snapshot unavailable"
        description="This report could not load its immutable audit snapshot."
        icon="◎"
      />
    );
  }

  return <OverviewDashboard result={result} />;
}
