import { useAuditStore } from '@popup/store/auditStore';

export function useAuditProgress() {
  const progress = useAuditStore((state) => state.progress);
  const currentCollector = useAuditStore((state) => state.currentCollector);
  const status = useAuditStore((state) => state.status);

  return {
    progress,
    currentCollector,
    isCollecting: status === 'collecting',
  };
}
