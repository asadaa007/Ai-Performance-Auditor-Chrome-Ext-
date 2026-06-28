import { ANALYSIS_THRESHOLDS } from '@features/analysis/constants/thresholds';
import { createIssue } from '@features/analysis/utils/createIssue';
import type { AnalysisRule } from '@features/analysis/types';
import type { AuditResult } from '@shared/types';

export const tooManyScriptsRule: AnalysisRule = {
  id: 'too-many-scripts',
  detect(audit: AuditResult) {
    const count = audit.javascript.totalScripts;
    if (count < ANALYSIS_THRESHOLDS.scriptCount) {
      return null;
    }

    return createIssue({
      id: 'too-many-scripts',
      title: 'High script element count',
      description: `${count} script elements detected (${audit.javascript.externalScripts} external, ${audit.javascript.inlineScripts} inline).`,
      category: 'JavaScript',
      subcategory: 'Script count',
      severity: count > ANALYSIS_THRESHOLDS.scriptCount * 2 ? 'High' : 'Medium',
      impact: 'High',
      confidence: 0.88,
      detectedBy: 'too-many-scripts',
      metric: 'scriptCount',
      currentValue: count,
      recommendedValue: ANALYSIS_THRESHOLDS.scriptCount,
      estimatedImprovement: 'Reduce JavaScript payload and parse cost',
      estimatedTimeToFix: '1 hour',
      affectedResources: audit.javascript.scripts
        .map((script) => script.src)
        .filter((src): src is string => Boolean(src))
        .slice(0, 10),
      documentationLinks: [
        'https://web.dev/articles/reduce-javascript-payloads-with-code-splitting',
      ],
      tags: ['javascript', 'scripts'],
    });
  },
};
