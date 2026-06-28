import { ANALYSIS_THRESHOLDS } from '@features/analysis/constants/thresholds';
import { createIssue } from '@features/analysis/utils/createIssue';
import type { AnalysisRule } from '@features/analysis/types';
import type { AuditResult } from '@shared/types';

export const tooManyStylesheetsRule: AnalysisRule = {
  id: 'too-many-stylesheets',
  detect(audit: AuditResult) {
    const count = audit.css.externalStylesheets + audit.css.inlineStyleBlocks;
    if (count < ANALYSIS_THRESHOLDS.stylesheetCount) {
      return null;
    }

    return createIssue({
      id: 'too-many-stylesheets',
      title: 'High stylesheet count',
      description: `${count} stylesheets detected (${audit.css.externalStylesheets} external, ${audit.css.inlineStyleBlocks} inline).`,
      category: 'CSS',
      subcategory: 'Stylesheet count',
      severity: count > ANALYSIS_THRESHOLDS.stylesheetCount * 2 ? 'High' : 'Medium',
      impact: 'Medium',
      confidence: 0.86,
      detectedBy: 'too-many-stylesheets',
      metric: 'stylesheetCount',
      currentValue: count,
      recommendedValue: ANALYSIS_THRESHOLDS.stylesheetCount,
      estimatedImprovement: 'Reduce CSS request count',
      estimatedTimeToFix: '1 hour',
      affectedResources: audit.css.stylesheets
        .map((sheet) => sheet.href)
        .filter((href): href is string => Boolean(href))
        .slice(0, 10),
      documentationLinks: ['https://web.dev/articles/extract-critical-css'],
      tags: ['css', 'stylesheets'],
    });
  },
};
