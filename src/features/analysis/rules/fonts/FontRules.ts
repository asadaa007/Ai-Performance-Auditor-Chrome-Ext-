import { ANALYSIS_THRESHOLDS } from '@features/analysis/constants/thresholds';
import { createIssue } from '@features/analysis/utils/createIssue';
import type { AnalysisRule } from '@features/analysis/types';
import type { AuditResult } from '@shared/types';

export const tooManyFontsRule: AnalysisRule = {
  id: 'too-many-fonts',
  detect(audit: AuditResult) {
    const count = audit.fonts.fontFamilies.length;
    if (count < ANALYSIS_THRESHOLDS.fontFamilyCount) {
      return null;
    }

    return createIssue({
      id: 'too-many-fonts',
      title: 'High font family count',
      description: `${count} unique font families detected with ${audit.fonts.totalFontRequests} font requests.`,
      category: 'Fonts',
      subcategory: 'Font families',
      severity: 'Medium',
      impact: 'Medium',
      confidence: 0.84,
      detectedBy: 'too-many-fonts',
      metric: 'fontFamilyCount',
      currentValue: count,
      recommendedValue: ANALYSIS_THRESHOLDS.fontFamilyCount,
      estimatedImprovement: 'Reduce font variant proliferation',
      estimatedTimeToFix: '30 minutes',
      affectedResources: audit.fonts.fontFamilies.slice(0, 10),
      documentationLinks: ['https://web.dev/articles/font-best-practices'],
      tags: ['fonts', 'typography'],
    });
  },
};

export const missingPreloadFontsRule: AnalysisRule = {
  id: 'missing-preload-fonts',
  detect(audit: AuditResult) {
    if (audit.fonts.fontFamilies.length < 3 || audit.fonts.preloadedFonts.length > 0) {
      return null;
    }

    return createIssue({
      id: 'missing-preload-fonts',
      title: 'No preloaded fonts',
      description: `${audit.fonts.fontFamilies.length} font families are used without any rel="preload" font hints.`,
      category: 'Fonts',
      subcategory: 'Preload',
      severity: 'Low',
      impact: 'Low',
      confidence: 0.75,
      detectedBy: 'missing-preload-fonts',
      metric: 'preloadedFontCount',
      currentValue: 0,
      recommendedValue: 1,
      estimatedImprovement: 'Reduce font discovery latency',
      estimatedTimeToFix: '15 minutes',
      affectedResources: audit.fonts.fontFamilies.slice(0, 5),
      documentationLinks: ['https://web.dev/articles/preload-critical-assets'],
      tags: ['fonts', 'preload'],
    });
  },
};
