import { useMemo } from 'react';
import { enterpriseScoringEngine } from '@features/enterprise-audit';
import type { EnterpriseAuditReport } from '@features/enterprise-audit';

export function useEnterpriseScore(report: EnterpriseAuditReport | null) {
  return useMemo(() => {
    if (!report) {
      return null;
    }
    return enterpriseScoringEngine.score(report);
  }, [report]);
}
