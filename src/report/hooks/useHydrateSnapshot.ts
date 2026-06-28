import { useEffect } from 'react';
import { getReportMessageBus } from '@report/messaging/reportBus';
import { getReportAuditId } from '@report/hooks/useReportAuditId';
import { useSnapshotStore } from '@report/store/snapshotStore';
import { loadAuditSnapshot } from '@shared/snapshots/loadSnapshot';

export function useHydrateSnapshot(): void {
  const auditId = getReportAuditId();

  useEffect(() => {
    if (!auditId) {
      useSnapshotStore.getState().setError('Missing audit snapshot id.');
      return;
    }

    const store = useSnapshotStore.getState();
    if (store.snapshot?.auditId === auditId) {
      return;
    }

    store.setLoading(auditId);

    void loadAuditSnapshot(getReportMessageBus(), auditId)
      .then((snapshot) => {
        if (!snapshot) {
          useSnapshotStore.getState().setError('Audit snapshot was not found.');
          return;
        }
        useSnapshotStore.getState().setSnapshot(snapshot);
      })
      .catch((error: unknown) => {
        useSnapshotStore.getState().setError(
          error instanceof Error ? error.message : 'Failed to load audit snapshot.',
        );
      });
  }, [auditId]);
}
