import { WEB_VITALS_DOC_LINKS } from '@features/analysis/constants/thresholds';
import { createIssue } from '@features/analysis/utils/createIssue';
import type { AnalysisRule } from '@features/analysis/types';
import { WEB_VITALS_THRESHOLDS } from '@shared/constants';
import type { AuditResult, WebVitalsMetric } from '@shared/types';
import { ratingLabel } from '@shared/utils';

function createVitalsRule(
  id: string,
  title: string,
  metricKey: keyof AuditResult['webVitals'],
  metricLabel: string,
  subcategory: string,
  docLink: string,
): AnalysisRule {
  return {
    id,
    detect(audit: AuditResult) {
      const metric = audit.webVitals[metricKey] as WebVitalsMetric;
      if (metric.status !== 'measured' || metric.value === null) {
        return null;
      }
      if (metric.rating === 'good') {
        return null;
      }

      const thresholds = WEB_VITALS_THRESHOLDS[metricKey as keyof typeof WEB_VITALS_THRESHOLDS];
      const severity = metric.rating === 'poor' ? 'High' : 'Medium';
      const impact = metric.rating === 'poor' ? 'Very High' : 'High';

      return createIssue({
        id,
        title,
        description: `${metricLabel} measured ${metric.value}${metric.unit === 'unitless' ? '' : ' ms'} (${ratingLabel(metric.rating)}). Threshold: good ≤ ${thresholds.good}, poor > ${thresholds.poor}.`,
        category: 'Performance',
        subcategory,
        severity,
        impact,
        confidence: 0.92,
        detectedBy: id,
        metric: metricLabel,
        currentValue: metric.value,
        recommendedValue: thresholds.good,
        estimatedImprovement: `Improve ${metricLabel} toward good threshold`,
        estimatedTimeToFix: 'Unknown',
        affectedResources: [audit.meta.url],
        documentationLinks: [docLink],
        tags: ['web-vitals', metricKey],
      });
    },
  };
}

export const poorLcpRule = createVitalsRule(
  'poor-lcp',
  'LCP above recommended threshold',
  'lcp',
  'LCP',
  'Web Vitals',
  WEB_VITALS_DOC_LINKS.lcp,
);

export const poorClsRule = createVitalsRule(
  'poor-cls',
  'CLS above recommended threshold',
  'cls',
  'CLS',
  'Web Vitals',
  WEB_VITALS_DOC_LINKS.cls,
);

export const poorInpRule = createVitalsRule(
  'poor-inp',
  'INP above recommended threshold',
  'inp',
  'INP',
  'Web Vitals',
  WEB_VITALS_DOC_LINKS.inp,
);

export const poorFcpRule = createVitalsRule(
  'poor-fcp',
  'FCP above recommended threshold',
  'fcp',
  'FCP',
  'Web Vitals',
  WEB_VITALS_DOC_LINKS.fcp,
);

export const poorTtfbRule = createVitalsRule(
  'poor-ttfb',
  'TTFB above recommended threshold',
  'ttfb',
  'TTFB',
  'Web Vitals',
  WEB_VITALS_DOC_LINKS.ttfb,
);
