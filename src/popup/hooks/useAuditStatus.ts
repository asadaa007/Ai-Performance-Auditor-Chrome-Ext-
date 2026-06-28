import { useAuditStore } from '@popup/store/auditStore';
import type { AuditStatus } from '@shared/messaging';

export function useAuditStatus() {
  const status = useAuditStore((state) => state.status);
  const error = useAuditStore((state) => state.error);
  const isHydrated = useAuditStore((state) => state.isHydrated);

  const isIdle = status === 'idle';
  const isCollecting = status === 'collecting';
  const isCompleted = status === 'completed';
  const isFailed = status === 'failed';
  const isLoading = isCollecting || (!isHydrated && status === 'idle');

  return {
    status: status as AuditStatus | 'idle',
    error,
    isHydrated,
    isIdle,
    isCollecting,
    isCompleted,
    isFailed,
    isLoading,
  };
}
