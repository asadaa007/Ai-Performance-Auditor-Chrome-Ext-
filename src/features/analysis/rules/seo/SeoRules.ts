import { createIssue } from '@features/analysis/utils/createIssue';
import type { AnalysisRule } from '@features/analysis/types';
import type { AuditResult } from '@shared/types';

export const missingTitleRule: AnalysisRule = {
  id: 'missing-title',
  detect(audit: AuditResult) {
    if (audit.metaTags.title && audit.metaTags.title.trim().length > 0) {
      return null;
    }

    return createIssue({
      id: 'missing-title',
      title: 'Missing document title',
      description: 'The page does not define a non-empty document title.',
      category: 'SEO',
      subcategory: 'Title',
      severity: 'High',
      impact: 'High',
      confidence: 0.98,
      detectedBy: 'missing-title',
      metric: 'title',
      currentValue: audit.metaTags.title,
      recommendedValue: 'non-empty title',
      estimatedImprovement: 'Improve document identification and SEO signals',
      estimatedTimeToFix: '5 minutes',
      affectedResources: [audit.meta.url],
      documentationLinks: ['https://developers.google.com/search/docs/appearance/title-link'],
      tags: ['seo', 'title'],
    });
  },
};

export const missingMetaDescriptionRule: AnalysisRule = {
  id: 'missing-meta-description',
  detect(audit: AuditResult) {
    if (audit.metaTags.description && audit.metaTags.description.trim().length > 0) {
      return null;
    }

    return createIssue({
      id: 'missing-meta-description',
      title: 'Missing meta description',
      description: 'The page does not define a meta description tag.',
      category: 'SEO',
      subcategory: 'Description',
      severity: 'Medium',
      impact: 'Medium',
      confidence: 0.96,
      detectedBy: 'missing-meta-description',
      metric: 'description',
      currentValue: audit.metaTags.description,
      recommendedValue: 'non-empty description',
      estimatedImprovement: 'Improve search snippet context',
      estimatedTimeToFix: '5 minutes',
      affectedResources: [audit.meta.url],
      documentationLinks: ['https://developers.google.com/search/docs/appearance/snippet'],
      tags: ['seo', 'meta'],
    });
  },
};

export const missingCanonicalRule: AnalysisRule = {
  id: 'missing-canonical',
  detect(audit: AuditResult) {
    if (audit.metaTags.canonicalUrl) {
      return null;
    }

    return createIssue({
      id: 'missing-canonical',
      title: 'Missing canonical URL',
      description: 'No link rel="canonical" element was found.',
      category: 'SEO',
      subcategory: 'Canonical',
      severity: 'Low',
      impact: 'Low',
      confidence: 0.9,
      detectedBy: 'missing-canonical',
      metric: 'canonicalUrl',
      currentValue: null,
      recommendedValue: audit.meta.url,
      estimatedImprovement: 'Clarify preferred URL for indexing',
      estimatedTimeToFix: '5 minutes',
      affectedResources: [audit.meta.url],
      documentationLinks: [
        'https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls',
      ],
      tags: ['seo', 'canonical'],
    });
  },
};
