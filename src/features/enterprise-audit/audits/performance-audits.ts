import {
  ENTERPRISE_AUDIT_THRESHOLDS,
  LIGHTHOUSE_DOCS_BASE,
} from '@features/enterprise-audit/config/thresholds';
import type { AuditContext, RunnableAudit } from '@features/enterprise-audit/types/audit';
import { defineAudit } from '@features/enterprise-audit/utils/auditHelpers';
import { ANALYSIS_THRESHOLDS } from '@features/analysis/constants/thresholds';
import { WEB_VITALS_THRESHOLDS } from '@shared/constants';
import type { WebVitalsMetric } from '@shared/types';

function vitalsAudit(
  id: string,
  lighthouseId: string,
  metricKey: keyof AuditContext['audit']['webVitals'],
  title: string,
  weight: number,
): RunnableAudit {
  return defineAudit({
    id,
    lighthouseId,
    category: 'performance',
    subcategory: 'metrics',
    title,
    description: `Measures ${title} against Lighthouse/Web Vitals thresholds.`,
    severity: 'High',
    weight,
    group: 'A',
    supportLevel: 'full',
    documentationRef: `${LIGHTHOUSE_DOCS_BASE}/performance/${lighthouseId}`,
    relatedResources: ['https://web.dev/vitals'],
    fixStrategy: `Improve ${title} to meet the good threshold.`,
    run({ audit }) {
      const metric = audit.webVitals[metricKey] as WebVitalsMetric;
      if (!metric.supported || metric.status === 'not-supported') {
        return {
          status: 'unsupported',
          pass: false,
          confidence: 'high',
          currentValue: null,
          expectedValue: null,
          threshold: null,
          unsupportedReason: 'Metric not supported in this browser.',
          missingCapability: 'PerformanceObserver for this vital',
          futureImplementation: 'Use supported Chromium versions with Web Vitals APIs.',
          evidence: { metric },
        };
      }
      if (metric.status !== 'measured' || metric.value === null) {
        return {
          status: 'skipped',
          pass: false,
          confidence: metric.confidence,
          currentValue: null,
          expectedValue:
            WEB_VITALS_THRESHOLDS[metricKey as keyof typeof WEB_VITALS_THRESHOLDS].good,
          threshold: `good ≤ ${WEB_VITALS_THRESHOLDS[metricKey as keyof typeof WEB_VITALS_THRESHOLDS].good}`,
          unsupportedReason: null,
          missingCapability: null,
          futureImplementation: null,
          evidence: { status: metric.status },
        };
      }
      const thresholds = WEB_VITALS_THRESHOLDS[metricKey as keyof typeof WEB_VITALS_THRESHOLDS];
      const pass = metric.rating === 'good';
      return {
        status: pass ? 'pass' : 'fail',
        pass,
        confidence: metric.confidence,
        currentValue: metric.value,
        expectedValue: thresholds.good,
        threshold: `good ≤ ${thresholds.good}, poor > ${thresholds.poor}`,
        unsupportedReason: null,
        missingCapability: null,
        futureImplementation: null,
        evidence: { rating: metric.rating, unit: metric.unit },
      };
    },
  });
}

export const performanceAudits: RunnableAudit[] = [
  vitalsAudit(
    'largest-contentful-paint',
    'largest-contentful-paint',
    'lcp',
    'Largest Contentful Paint',
    15,
  ),
  vitalsAudit(
    'cumulative-layout-shift',
    'cumulative-layout-shift',
    'cls',
    'Cumulative Layout Shift',
    12,
  ),
  vitalsAudit(
    'interaction-to-next-paint',
    'interaction-to-next-paint',
    'inp',
    'Interaction to Next Paint',
    12,
  ),
  vitalsAudit(
    'first-contentful-paint',
    'first-contentful-paint',
    'fcp',
    'First Contentful Paint',
    10,
  ),
  vitalsAudit('server-response-time', 'server-response-time', 'ttfb', 'Time to First Byte', 8),
  defineAudit({
    id: 'total-blocking-time',
    lighthouseId: 'total-blocking-time',
    category: 'performance',
    subcategory: 'main-thread',
    title: 'Total Blocking Time',
    description: 'Sum of blocking time from long tasks after FCP.',
    severity: 'High',
    weight: 10,
    group: 'B',
    supportLevel: 'partial',
    limitations: ['Observed post-load window only', 'Not identical to Lighthouse lab TBT'],
    documentationRef: `${LIGHTHOUSE_DOCS_BASE}/performance/lighthouse-total-blocking-time`,
    relatedResources: [],
    fixStrategy: 'Reduce long tasks and JavaScript execution on the main thread.',
    run({ audit }) {
      const { longTasks } = audit;
      if (!longTasks.supported) {
        return {
          status: 'unsupported',
          pass: false,
          confidence: 'high',
          currentValue: null,
          expectedValue: ENTERPRISE_AUDIT_THRESHOLDS.tbtGoodMs,
          threshold: `< ${ENTERPRISE_AUDIT_THRESHOLDS.tbtGoodMs}ms good`,
          unsupportedReason: 'Long task API unavailable.',
          missingCapability: 'PerformanceObserver longtask',
          futureImplementation: 'Chromium long-task observer',
          evidence: {},
        };
      }
      const pass = longTasks.totalBlockingTime <= ENTERPRISE_AUDIT_THRESHOLDS.tbtGoodMs;
      return {
        status: pass ? 'pass' : 'fail',
        pass,
        confidence: 'medium',
        currentValue: longTasks.totalBlockingTime,
        expectedValue: ENTERPRISE_AUDIT_THRESHOLDS.tbtGoodMs,
        threshold: `≤ ${ENTERPRISE_AUDIT_THRESHOLDS.tbtGoodMs}ms`,
        unsupportedReason: null,
        missingCapability: null,
        futureImplementation: null,
        evidence: { longTaskCount: longTasks.longTaskCount },
      };
    },
  }),
  defineAudit({
    id: 'long-tasks',
    lighthouseId: 'long-tasks',
    category: 'performance',
    subcategory: 'main-thread',
    title: 'Avoid long main-thread tasks',
    description: 'Detects main-thread tasks longer than 50ms.',
    severity: 'Medium',
    weight: 6,
    group: 'B',
    supportLevel: 'partial',
    limitations: ['Observation window limited to content script lifetime'],
    documentationRef: `${LIGHTHOUSE_DOCS_BASE}/performance/long-tasks`,
    relatedResources: [],
    fixStrategy: 'Split long tasks using requestIdleCallback or workers.',
    run({ audit }) {
      const count = audit.longTasks.longTaskCount;
      const pass = count <= ENTERPRISE_AUDIT_THRESHOLDS.longTaskCount;
      return {
        status: audit.longTasks.supported ? (pass ? 'pass' : 'fail') : 'unsupported',
        pass,
        confidence: 'medium',
        currentValue: count,
        expectedValue: 0,
        threshold: `≤ ${ENTERPRISE_AUDIT_THRESHOLDS.longTaskCount} long tasks`,
        unsupportedReason: audit.longTasks.supported ? null : 'Long task API unavailable',
        missingCapability: audit.longTasks.supported ? null : 'PerformanceObserver longtask',
        futureImplementation: null,
        evidence: { tasks: audit.longTasks.tasks.slice(0, 10) },
      };
    },
  }),
  defineAudit({
    id: 'total-byte-weight',
    lighthouseId: 'total-byte-weight',
    category: 'performance',
    subcategory: 'payload',
    title: 'Avoid enormous network payloads',
    description: 'Measures total transfer size of all resources.',
    severity: 'Medium',
    weight: 6,
    group: 'A',
    supportLevel: 'full',
    documentationRef: `${LIGHTHOUSE_DOCS_BASE}/performance/total-byte-weight`,
    relatedResources: [],
    fixStrategy: 'Compress assets, remove unused resources, optimize images.',
    run({ audit }) {
      const bytes = audit.resources.totalTransferSize;
      const pass = bytes <= ENTERPRISE_AUDIT_THRESHOLDS.totalTransferBytes;
      return {
        status: pass ? 'pass' : 'fail',
        pass,
        confidence: 'high',
        currentValue: bytes,
        expectedValue: ENTERPRISE_AUDIT_THRESHOLDS.totalTransferBytes,
        threshold: `≤ ${ENTERPRISE_AUDIT_THRESHOLDS.totalTransferBytes} bytes`,
        unsupportedReason: null,
        missingCapability: null,
        futureImplementation: null,
        evidence: { totalRequests: audit.resources.totalRequests },
      };
    },
  }),
  defineAudit({
    id: 'render-blocking-resources',
    lighthouseId: 'render-blocking-resources',
    category: 'performance',
    subcategory: 'render-blocking',
    title: 'Eliminate render-blocking resources',
    description: 'Detects blocking scripts and stylesheets in the document head.',
    severity: 'High',
    weight: 8,
    group: 'B',
    supportLevel: 'partial',
    limitations: ['Static DOM analysis only', 'Does not evaluate dynamic injection'],
    documentationRef: `${LIGHTHOUSE_DOCS_BASE}/performance/render-blocking-resources`,
    relatedResources: [],
    fixStrategy: 'Defer/async scripts and inline critical CSS.',
    run({ audit }) {
      const blocking = audit.resources.renderBlockingResources.filter((r) => r.blocking);
      const pass = blocking.length <= ENTERPRISE_AUDIT_THRESHOLDS.renderBlockingCount;
      return {
        status: pass ? 'pass' : 'fail',
        pass,
        confidence: 'medium',
        currentValue: blocking.length,
        expectedValue: 0,
        threshold: `≤ ${ENTERPRISE_AUDIT_THRESHOLDS.renderBlockingCount} blocking resources`,
        unsupportedReason: null,
        missingCapability: null,
        futureImplementation: null,
        evidence: { blocking: blocking.slice(0, 20) },
      };
    },
  }),
  defineAudit({
    id: 'dom-size',
    lighthouseId: 'dom-size',
    category: 'performance',
    subcategory: 'dom',
    title: 'Avoid an excessive DOM size',
    description: 'Measures total DOM nodes and depth.',
    severity: 'Medium',
    weight: 5,
    group: 'A',
    supportLevel: 'full',
    documentationRef: `${LIGHTHOUSE_DOCS_BASE}/performance/dom-size`,
    relatedResources: [],
    fixStrategy: 'Reduce DOM complexity and unnecessary wrappers.',
    run({ audit }) {
      const nodes = audit.dom.totalNodes;
      const pass =
        nodes <= ANALYSIS_THRESHOLDS.domNodeCount &&
        audit.dom.maxDepth <= ANALYSIS_THRESHOLDS.domMaxDepth;
      return {
        status: pass ? 'pass' : 'fail',
        pass,
        confidence: 'high',
        currentValue: nodes,
        expectedValue: ANALYSIS_THRESHOLDS.domNodeCount,
        threshold: `≤ ${ANALYSIS_THRESHOLDS.domNodeCount} nodes`,
        unsupportedReason: null,
        missingCapability: null,
        futureImplementation: null,
        evidence: { maxDepth: audit.dom.maxDepth },
      };
    },
  }),
  defineAudit({
    id: 'uses-rel-preconnect',
    lighthouseId: 'uses-rel-preconnect',
    category: 'performance',
    subcategory: 'resource-hints',
    title: 'Preconnect to required origins',
    description: 'Checks for preconnect hints to third-party origins.',
    severity: 'Low',
    weight: 3,
    group: 'B',
    supportLevel: 'partial',
    limitations: ['Cannot determine if preconnect targets are required without origin analysis'],
    documentationRef: `${LIGHTHOUSE_DOCS_BASE}/performance/uses-rel-preconnect`,
    relatedResources: [],
    fixStrategy: 'Add <link rel="preconnect"> for critical third-party origins.',
    run({ audit }) {
      const thirdPartyDomains = audit.thirdParty.uniqueThirdPartyDomains.length;
      const preconnects = audit.resources.preconnectHints.length;
      const pass = thirdPartyDomains === 0 || preconnects > 0;
      return {
        status: pass ? 'pass' : 'fail',
        pass,
        confidence: 'low',
        currentValue: preconnects,
        expectedValue: thirdPartyDomains,
        threshold: 'preconnect hints for third-party origins',
        unsupportedReason: null,
        missingCapability: null,
        futureImplementation: null,
        evidence: { preconnects: audit.resources.preconnectHints },
      };
    },
  }),
  defineAudit({
    id: 'modern-image-formats',
    lighthouseId: 'modern-image-formats',
    category: 'performance',
    subcategory: 'images',
    title: 'Serve images in modern formats',
    description: 'Checks ratio of WebP/AVIF images.',
    severity: 'Medium',
    weight: 5,
    group: 'A',
    supportLevel: 'full',
    documentationRef: `${LIGHTHOUSE_DOCS_BASE}/performance/uses-webp-images`,
    relatedResources: [],
    fixStrategy: 'Convert images to WebP or AVIF.',
    run({ audit }) {
      const total = audit.images.totalImages;
      if (total === 0) {
        return {
          status: 'skipped',
          pass: true,
          confidence: 'high',
          currentValue: 0,
          expectedValue: null,
          threshold: null,
          unsupportedReason: null,
          missingCapability: null,
          futureImplementation: null,
          evidence: {},
        };
      }
      const ratio = audit.images.modernFormatCount / total;
      const pass = ratio >= 0.5 || audit.images.legacyFormatCount === 0;
      return {
        status: pass ? 'pass' : 'fail',
        pass,
        confidence: 'high',
        currentValue: Math.round(ratio * 100),
        expectedValue: 50,
        threshold: '≥ 50% modern formats',
        unsupportedReason: null,
        missingCapability: null,
        futureImplementation: null,
        evidence: {
          modern: audit.images.modernFormatCount,
          legacy: audit.images.legacyFormatCount,
        },
      };
    },
  }),
  defineAudit({
    id: 'uses-responsive-images',
    lighthouseId: 'uses-responsive-images',
    category: 'performance',
    subcategory: 'images',
    title: 'Properly size images',
    description: 'Detects images missing dimensions or oversized.',
    severity: 'Medium',
    weight: 5,
    group: 'B',
    supportLevel: 'partial',
    limitations: ['Cannot compare natural vs displayed size without layout snapshot'],
    documentationRef: `${LIGHTHOUSE_DOCS_BASE}/performance/uses-responsive-images`,
    relatedResources: [],
    fixStrategy: 'Use srcset and width/height attributes.',
    run({ audit }) {
      const pass = audit.images.missingDimensionsCount === 0 && audit.images.oversizedCount === 0;
      return {
        status: pass ? 'pass' : 'fail',
        pass,
        confidence: 'medium',
        currentValue: audit.images.missingDimensionsCount,
        expectedValue: 0,
        threshold: '0 images missing dimensions',
        unsupportedReason: null,
        missingCapability: null,
        futureImplementation: null,
        evidence: { oversized: audit.images.oversizedCount },
      };
    },
  }),
  defineAudit({
    id: 'offscreen-images',
    lighthouseId: 'offscreen-images',
    category: 'performance',
    subcategory: 'images',
    title: 'Defer offscreen images',
    description: 'Checks lazy-loading coverage for images.',
    severity: 'Medium',
    weight: 4,
    group: 'B',
    supportLevel: 'partial',
    limitations: ['Does not measure viewport intersection'],
    documentationRef: `${LIGHTHOUSE_DOCS_BASE}/performance/offscreen-images`,
    relatedResources: [],
    fixStrategy: 'Add loading="lazy" to below-fold images.',
    run({ audit }) {
      const total = audit.images.totalImages;
      if (total === 0) {
        return {
          status: 'skipped',
          pass: true,
          confidence: 'high',
          currentValue: 0,
          expectedValue: null,
          threshold: null,
          unsupportedReason: null,
          missingCapability: null,
          futureImplementation: null,
          evidence: {},
        };
      }
      const lazyRatio = audit.images.lazyLoadedCount / total;
      const pass = lazyRatio >= 1 - ANALYSIS_THRESHOLDS.missingLazyLoadRatio;
      return {
        status: pass ? 'pass' : 'fail',
        pass,
        confidence: 'low',
        currentValue: Math.round(lazyRatio * 100),
        expectedValue: 50,
        threshold: '≥ 50% lazy loaded',
        unsupportedReason: null,
        missingCapability: null,
        futureImplementation: null,
        evidence: { lazyLoaded: audit.images.lazyLoadedCount, total },
      };
    },
  }),
  defineAudit({
    id: 'third-party-summary',
    lighthouseId: 'third-party-summary',
    category: 'performance',
    subcategory: 'third-party',
    title: 'Minimize third-party usage',
    description: 'Measures third-party request volume and transfer size.',
    severity: 'Medium',
    weight: 5,
    group: 'A',
    supportLevel: 'full',
    documentationRef: `${LIGHTHOUSE_DOCS_BASE}/performance/third-party-summary`,
    relatedResources: [],
    fixStrategy: 'Reduce third-party scripts and defer non-critical tags.',
    run({ audit }) {
      const count = audit.thirdParty.thirdPartyRequestCount;
      const pass = count <= ENTERPRISE_AUDIT_THRESHOLDS.thirdPartyRequestCount;
      return {
        status: pass ? 'pass' : 'fail',
        pass,
        confidence: 'high',
        currentValue: count,
        expectedValue: ENTERPRISE_AUDIT_THRESHOLDS.thirdPartyRequestCount,
        threshold: `≤ ${ENTERPRISE_AUDIT_THRESHOLDS.thirdPartyRequestCount} requests`,
        unsupportedReason: null,
        missingCapability: null,
        futureImplementation: null,
        evidence: { transferSize: audit.thirdParty.thirdPartyTransferSize },
      };
    },
  }),
];
