import { createIssue } from '@features/analysis/utils/createIssue';
import type { AnalysisRule } from '@features/analysis/types';
import type { AuditResult } from '@shared/types';

export const missingLangRule: AnalysisRule = {
  id: 'missing-lang',
  detect(audit: AuditResult) {
    if (audit.accessibility.hasLangAttribute) {
      return null;
    }

    return createIssue({
      id: 'missing-lang',
      title: 'Missing html lang attribute',
      description: 'The document root element does not define a lang attribute.',
      category: 'Accessibility',
      subcategory: 'Document language',
      severity: 'Medium',
      impact: 'Medium',
      confidence: 0.95,
      detectedBy: 'missing-lang',
      metric: 'hasLangAttribute',
      currentValue: 'false',
      recommendedValue: 'true',
      estimatedImprovement: 'Improve screen reader language detection',
      estimatedTimeToFix: '5 minutes',
      affectedResources: [audit.meta.url],
      documentationLinks: ['https://www.w3.org/WAI/WCAG21/Understanding/language-of-page.html'],
      tags: ['accessibility', 'lang'],
    });
  },
};

export const missingAltTextRule: AnalysisRule = {
  id: 'missing-alt-text',
  detect(audit: AuditResult) {
    if (audit.accessibility.missingAltCount === 0) {
      return null;
    }

    return createIssue({
      id: 'missing-alt-text',
      title: 'Images missing alt text',
      description: `${audit.accessibility.missingAltCount} images are missing alt attributes.`,
      category: 'Accessibility',
      subcategory: 'Alt text',
      severity: audit.accessibility.missingAltCount > 5 ? 'High' : 'Medium',
      impact: 'High',
      confidence: 0.93,
      detectedBy: 'missing-alt-text',
      metric: 'missingAltCount',
      currentValue: audit.accessibility.missingAltCount,
      recommendedValue: 0,
      estimatedImprovement: 'Improve non-text content accessibility',
      estimatedTimeToFix: '15 minutes',
      affectedResources: audit.accessibility.missingAltElements.slice(0, 10),
      documentationLinks: ['https://www.w3.org/WAI/WCAG21/Understanding/non-text-content.html'],
      tags: ['accessibility', 'images', 'alt'],
    });
  },
};

export const missingFormLabelsRule: AnalysisRule = {
  id: 'missing-form-labels',
  detect(audit: AuditResult) {
    if (audit.accessibility.missingFormLabelsCount === 0) {
      return null;
    }

    return createIssue({
      id: 'missing-form-labels',
      title: 'Form controls missing labels',
      description: `${audit.accessibility.missingFormLabelsCount} form controls lack associated labels.`,
      category: 'Accessibility',
      subcategory: 'Form labels',
      severity: 'Medium',
      impact: 'Medium',
      confidence: 0.9,
      detectedBy: 'missing-form-labels',
      metric: 'missingFormLabelsCount',
      currentValue: audit.accessibility.missingFormLabelsCount,
      recommendedValue: 0,
      estimatedImprovement: 'Improve form control accessibility',
      estimatedTimeToFix: '30 minutes',
      affectedResources: audit.accessibility.missingFormLabelElements.slice(0, 10),
      documentationLinks: [
        'https://www.w3.org/WAI/WCAG21/Understanding/labels-or-instructions.html',
      ],
      tags: ['accessibility', 'forms'],
    });
  },
};
