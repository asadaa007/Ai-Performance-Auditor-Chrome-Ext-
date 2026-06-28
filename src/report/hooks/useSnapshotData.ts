import { useSnapshotStore } from '@report/store/snapshotStore';

export function useSnapshotData() {
  const snapshot = useSnapshotStore((state) => state.snapshot);
  const auditId = useSnapshotStore((state) => state.auditId);
  const isLoading = useSnapshotStore((state) => state.isLoading);
  const error = useSnapshotStore((state) => state.error);

  return {
    snapshot,
    auditId,
    isLoading,
    error,
    hasSnapshot: snapshot !== null,
    result: snapshot?.auditResult ?? null,
    analysis: snapshot?.analysisResult ?? null,
    score: snapshot?.scoreResult ?? null,
    enterpriseReport: snapshot?.enterpriseAuditResult ?? null,
    enterpriseScore: snapshot?.enterpriseScoreResult ?? null,
    fixPlan: snapshot?.fixPlan ?? null,
    frameworkProfile: snapshot?.frameworkProfile ?? null,
    url: snapshot?.url ?? null,
    timestamp: snapshot?.timestamp ?? null,
  };
}
