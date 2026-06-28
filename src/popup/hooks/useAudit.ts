import { useCallback } from 'react';
import { getPopupMessageBus } from '@popup/messaging/popupBus';
import { clearAudit, requestAudit, useAuditStore } from '@popup/store/auditStore';
import { auditErrorFromSerialized } from '@shared/errors';

export function useAudit() {
  const status = useAuditStore((state) => state.status);
  const result = useAuditStore((state) => state.result);
  const error = useAuditStore((state) => state.error);
  const url = useAuditStore((state) => state.url);
  const collectionDurationMs = useAuditStore((state) => state.collectionDurationMs);
  const isHydrated = useAuditStore((state) => state.isHydrated);

  const startAudit = useCallback(async () => {
    try {
      await requestAudit(getPopupMessageBus());
    } catch (caught) {
      const serialized =
        caught instanceof Error
          ? auditErrorFromSerialized({
              code: 'UNKNOWN',
              name: caught.name,
              message: caught.message,
            })
          : auditErrorFromSerialized({
              code: 'UNKNOWN',
              name: 'Error',
              message: String(caught),
            });

      useAuditStore.setState({
        status: 'failed',
        error: serialized,
      });
    }
  }, []);

  const clear = useCallback(async () => {
    await clearAudit(getPopupMessageBus());
  }, []);

  return {
    status,
    result,
    error,
    url,
    collectionDurationMs,
    isHydrated,
    startAudit,
    clearAudit: clear,
  };
}
