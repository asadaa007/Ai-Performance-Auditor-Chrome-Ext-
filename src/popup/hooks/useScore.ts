import { useMemo } from 'react';
import { scoringEngine } from '@features/scoring';
import type { ScoreResult } from '@features/scoring';
import type { AnalysisResult } from '@features/analysis';

export function useScore(analysis: AnalysisResult | null): ScoreResult | null {
  return useMemo(() => {
    if (!analysis) {
      return null;
    }
    return scoringEngine.score(analysis);
  }, [analysis]);
}
