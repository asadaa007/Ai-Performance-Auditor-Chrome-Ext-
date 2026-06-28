import { analysisEngine } from '@features/analysis';
import type { AnalysisResult } from '@features/analysis';
import type { AuditResult } from '@shared/types';
import { useMemo } from 'react';

export function useAnalysis(result: AuditResult | null): AnalysisResult | null {
  return useMemo(() => {
    if (!result) {
      return null;
    }
    return analysisEngine.analyze(result);
  }, [result]);
}
