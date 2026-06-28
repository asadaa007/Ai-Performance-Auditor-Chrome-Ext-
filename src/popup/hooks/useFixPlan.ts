import { fixPlanner } from '@features/fix-planner';
import type { FixPlan } from '@features/fix-planner';
import type { AnalysisResult } from '@features/analysis';
import type { AuditResult } from '@shared/types';
import { useMemo } from 'react';

export function useFixPlan(
  audit: AuditResult | null,
  analysis: AnalysisResult | null,
): FixPlan | null {
  return useMemo(() => {
    if (!audit || !analysis) {
      return null;
    }
    return fixPlanner.plan(audit, analysis);
  }, [audit, analysis]);
}
