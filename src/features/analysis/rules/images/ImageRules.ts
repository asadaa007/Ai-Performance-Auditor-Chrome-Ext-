import { ANALYSIS_THRESHOLDS } from '@features/analysis/constants/thresholds';
import { createIssue } from '@features/analysis/utils/createIssue';
import type { AnalysisRule } from '@features/analysis/types';
import type { AuditResult } from '@shared/types';
import { formatBytes } from '@shared/utils';

export const largeImageRule: AnalysisRule = {
  id: 'large-images',
  detect(audit: AuditResult) {
    const large = audit.images.images.filter(
      (image) =>
        image.transferSize !== null && image.transferSize >= ANALYSIS_THRESHOLDS.largeImageBytes,
    );

    if (large.length < ANALYSIS_THRESHOLDS.largeImageCount) {
      return null;
    }

    return createIssue({
      id: 'large-images',
      title: 'Large image payloads detected',
      description: `${large.length} images exceed ${formatBytes(ANALYSIS_THRESHOLDS.largeImageBytes)} transfer size.`,
      category: 'Images',
      subcategory: 'Payload size',
      severity: large.length > 5 ? 'High' : 'Medium',
      impact: 'High',
      confidence: 0.9,
      detectedBy: 'large-images',
      metric: 'largeImageCount',
      currentValue: large.length,
      recommendedValue: 0,
      estimatedImprovement: 'Reduce image byte weight',
      estimatedTimeToFix: '30 minutes',
      affectedResources: large.slice(0, 10).map((image) => image.src),
      documentationLinks: ['https://web.dev/articles/choose-the-right-image-format'],
      tags: ['images', 'size'],
    });
  },
};

export const missingLazyLoadRule: AnalysisRule = {
  id: 'missing-lazy-load',
  detect(audit: AuditResult) {
    if (audit.images.totalImages < 4) {
      return null;
    }

    const notLazy = audit.images.images.filter((image) => !image.lazyLoaded);
    const ratio = notLazy.length / audit.images.totalImages;

    if (ratio < ANALYSIS_THRESHOLDS.missingLazyLoadRatio) {
      return null;
    }

    return createIssue({
      id: 'missing-lazy-load',
      title: 'Many images without lazy loading',
      description: `${notLazy.length} of ${audit.images.totalImages} images do not use loading="lazy".`,
      category: 'Images',
      subcategory: 'Loading',
      severity: 'Medium',
      impact: 'Medium',
      confidence: 0.8,
      detectedBy: 'missing-lazy-load',
      metric: 'nonLazyImageCount',
      currentValue: notLazy.length,
      recommendedValue: 0,
      estimatedImprovement: 'Defer offscreen image loading',
      estimatedTimeToFix: '15 minutes',
      affectedResources: notLazy.slice(0, 10).map((image) => image.src),
      documentationLinks: ['https://web.dev/articles/browser-level-image-lazy-loading'],
      tags: ['images', 'lazy-load'],
    });
  },
};

export const missingImageDimensionsRule: AnalysisRule = {
  id: 'missing-image-dimensions',
  detect(audit: AuditResult) {
    const missing = audit.images.images.filter((image) => image.missingDimensions);
    if (missing.length < ANALYSIS_THRESHOLDS.missingDimensionsCount) {
      return null;
    }

    return createIssue({
      id: 'missing-image-dimensions',
      title: 'Images missing width/height attributes',
      description: `${missing.length} images lack explicit width and height attributes.`,
      category: 'Images',
      subcategory: 'Layout stability',
      severity: 'Medium',
      impact: 'Medium',
      confidence: 0.88,
      detectedBy: 'missing-image-dimensions',
      metric: 'missingDimensionsCount',
      currentValue: missing.length,
      recommendedValue: 0,
      estimatedImprovement: 'Stabilize layout during image load',
      estimatedTimeToFix: '15 minutes',
      affectedResources: missing.slice(0, 10).map((image) => image.src),
      documentationLinks: ['https://web.dev/articles/optimize-cls#images_without_dimensions'],
      tags: ['images', 'cls', 'dimensions'],
    });
  },
};
