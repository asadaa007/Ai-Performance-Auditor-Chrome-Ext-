import { ANALYSIS_THRESHOLDS } from '@features/analysis/constants/thresholds';
import { createIssue } from '@features/analysis/utils/createIssue';
import type { AnalysisRule } from '@features/analysis/types';
import type { AuditResult } from '@shared/types';

export const duplicateJsRule: AnalysisRule = {
  id: 'duplicate-js',
  detect(audit: AuditResult) {
    const duplicates = audit.resources.duplicateResources.filter((group) =>
      group.entries.some(
        (entry) => entry.initiatorType === 'script' || /\.m?js(\?|$)/i.test(entry.name),
      ),
    );

    if (duplicates.length < ANALYSIS_THRESHOLDS.duplicateResourceCount) {
      return null;
    }

    return createIssue({
      id: 'duplicate-js',
      title: 'Duplicate JavaScript resources',
      description: `${duplicates.length} JavaScript URLs were requested more than once.`,
      category: 'Resources',
      subcategory: 'Duplicates',
      severity: 'Medium',
      impact: 'Medium',
      confidence: 0.87,
      detectedBy: 'duplicate-js',
      metric: 'duplicateJsCount',
      currentValue: duplicates.length,
      recommendedValue: 0,
      estimatedImprovement: 'Eliminate duplicate script downloads',
      estimatedTimeToFix: '30 minutes',
      affectedResources: duplicates.slice(0, 10).map((group) => group.url),
      documentationLinks: ['https://web.dev/articles/reduce-network-payloads-using-webpack'],
      tags: ['javascript', 'duplicate'],
    });
  },
};

export const duplicateCssRule: AnalysisRule = {
  id: 'duplicate-css',
  detect(audit: AuditResult) {
    const duplicates = audit.resources.duplicateResources.filter((group) =>
      group.entries.some(
        (entry) => entry.initiatorType === 'css' || /\.css(\?|$)/i.test(entry.name),
      ),
    );

    if (duplicates.length < ANALYSIS_THRESHOLDS.duplicateResourceCount) {
      return null;
    }

    return createIssue({
      id: 'duplicate-css',
      title: 'Duplicate CSS resources',
      description: `${duplicates.length} stylesheet URLs were requested more than once.`,
      category: 'Resources',
      subcategory: 'Duplicates',
      severity: 'Medium',
      impact: 'Medium',
      confidence: 0.87,
      detectedBy: 'duplicate-css',
      metric: 'duplicateCssCount',
      currentValue: duplicates.length,
      recommendedValue: 0,
      estimatedImprovement: 'Eliminate duplicate stylesheet downloads',
      estimatedTimeToFix: '30 minutes',
      affectedResources: duplicates.slice(0, 10).map((group) => group.url),
      documentationLinks: ['https://web.dev/articles/reduce-network-payloads-using-webpack'],
      tags: ['css', 'duplicate'],
    });
  },
};
