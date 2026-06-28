import { useAuditStore } from '@popup/store/auditStore';
import type { AuditResult } from '@shared/types';

export function useAuditData() {
  const result = useAuditStore((state) => state.result);
  const status = useAuditStore((state) => state.status);
  const error = useAuditStore((state) => state.error);
  const progress = useAuditStore((state) => state.progress);
  const currentCollector = useAuditStore((state) => state.currentCollector);
  const url = useAuditStore((state) => state.url);
  const isHydrated = useAuditStore((state) => state.isHydrated);
  const collectionDurationMs = useAuditStore((state) => state.collectionDurationMs);

  const hasAudit = status === 'completed' && result !== null;
  const isCollecting = status === 'collecting';
  const isFailed = status === 'failed';
  const isIdle = status === 'idle';

  return {
    result: result as AuditResult | null,
    status,
    error,
    progress,
    currentCollector,
    url,
    isHydrated,
    collectionDurationMs,
    hasAudit,
    isCollecting,
    isFailed,
    isIdle,
  };
}
