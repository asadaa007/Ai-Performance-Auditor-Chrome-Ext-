import { useMemo } from 'react';
import { enterpriseAuditEngine } from '@features/enterprise-audit';
import type { EnterpriseAuditReport } from '@features/enterprise-audit';
import type { AuditResult } from '@shared/types';

export function useEnterpriseAudit(audit: AuditResult | null): EnterpriseAuditReport | null {
  return useMemo(() => {
    if (!audit) {
      return null;
    }
    return enterpriseAuditEngine.runAll(audit);
  }, [audit]);
}
