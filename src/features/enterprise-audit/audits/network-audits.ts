import {
  ENTERPRISE_AUDIT_THRESHOLDS,
  LIGHTHOUSE_DOCS_BASE,
} from '@features/enterprise-audit/config/thresholds';
import type { RunnableAudit } from '@features/enterprise-audit/types/audit';
import { defineAudit } from '@features/enterprise-audit/utils/auditHelpers';

export const networkAudits: RunnableAudit[] = [
  defineAudit({
    id: 'uses-text-compression',
    lighthouseId: 'uses-text-compression',
    category: 'network',
    subcategory: 'compression',
    title: 'Enable text compression',
    description: 'Detects uncompressed text resources via transfer/encoded size ratio.',
    severity: 'Medium',
    weight: 6,
    group: 'B',
    supportLevel: 'partial',
    limitations: ['Heuristic based on Resource Timing sizes', 'No direct Content-Encoding header'],
    documentationRef: `${LIGHTHOUSE_DOCS_BASE}/performance/uses-text-compression`,
    relatedResources: [],
    fixStrategy: 'Enable gzip or Brotli compression on the server.',
    run({ audit }) {
      const uncompressed = audit.resources.uncompressedTextResources.length;
      const pass = uncompressed <= ENTERPRISE_AUDIT_THRESHOLDS.uncompressedResourceCount;
      return {
        status: pass ? 'pass' : 'fail',
        pass,
        confidence: 'medium',
        currentValue: uncompressed,
        expectedValue: 0,
        threshold: `≤ ${ENTERPRISE_AUDIT_THRESHOLDS.uncompressedResourceCount} uncompressed text resources`,
        unsupportedReason: null,
        missingCapability: null,
        futureImplementation: null,
        evidence: { samples: audit.resources.uncompressedTextResources.slice(0, 10) },
      };
    },
  }),
  defineAudit({
    id: 'uses-http2',
    lighthouseId: 'uses-http2',
    category: 'network',
    subcategory: 'protocol',
    title: 'Use HTTP/2',
    description: 'Checks navigation protocol from Performance Navigation Timing.',
    severity: 'Low',
    weight: 3,
    group: 'B',
    supportLevel: 'partial',
    limitations: ['Reports document navigation protocol only'],
    documentationRef: `${LIGHTHOUSE_DOCS_BASE}/best-practices/uses-http2`,
    relatedResources: [],
    fixStrategy: 'Enable HTTP/2 or HTTP/3 on the server.',
    run({ audit }) {
      const protocol = audit.navigationTiming.protocol ?? '';
      const pass = /h2|h3/i.test(protocol);
      return {
        status: protocol ? (pass ? 'pass' : 'fail') : 'skipped',
        pass,
        confidence: 'medium',
        currentValue: protocol,
        expectedValue: 'h2 or h3',
        threshold: 'HTTP/2+',
        unsupportedReason: null,
        missingCapability: null,
        futureImplementation: null,
        evidence: {},
      };
    },
  }),
  defineAudit({
    id: 'network-rtt',
    lighthouseId: 'network-rtt',
    category: 'network',
    subcategory: 'latency',
    title: 'Network round trip time',
    description: 'Reports DNS + TCP timing as RTT proxy.',
    severity: 'Info',
    weight: 2,
    group: 'B',
    supportLevel: 'partial',
    limitations: ['Not true RTT', 'Navigation timing proxy only'],
    documentationRef: `${LIGHTHOUSE_DOCS_BASE}/performance/network-rtt`,
    relatedResources: [],
    fixStrategy: 'Use CDN edge closer to users.',
    run({ audit }) {
      const dns = audit.navigationTiming.dnsLookup.value ?? 0;
      const tcp = audit.navigationTiming.tcpConnection.value ?? 0;
      const rtt = dns + tcp;
      return {
        status: 'pass',
        pass: true,
        confidence: 'low',
        currentValue: rtt,
        expectedValue: null,
        threshold: null,
        unsupportedReason: null,
        missingCapability: null,
        futureImplementation: null,
        evidence: { dns, tcp },
      };
    },
  }),
  defineAudit({
    id: 'network-server-latency',
    lighthouseId: 'network-server-latency',
    category: 'network',
    subcategory: 'latency',
    title: 'Server response time',
    description: 'TTFB from navigation timing as server latency proxy.',
    severity: 'Medium',
    weight: 5,
    group: 'B',
    supportLevel: 'partial',
    limitations: ['Field TTFB not lab server latency'],
    documentationRef: `${LIGHTHOUSE_DOCS_BASE}/performance/server-response-time`,
    relatedResources: [],
    fixStrategy: 'Optimize server response and caching.',
    run({ audit }) {
      const ttfb = audit.webVitals.ttfb;
      if (ttfb.status !== 'measured' || ttfb.value === null) {
        return {
          status: 'skipped',
          pass: false,
          confidence: 'low',
          currentValue: null,
          expectedValue: 800,
          threshold: '≤ 800ms',
          unsupportedReason: null,
          missingCapability: null,
          futureImplementation: null,
          evidence: {},
        };
      }
      const pass = ttfb.rating === 'good';
      return {
        status: pass ? 'pass' : 'fail',
        pass,
        confidence: ttfb.confidence,
        currentValue: ttfb.value,
        expectedValue: 800,
        threshold: 'good TTFB ≤ 800ms',
        unsupportedReason: null,
        missingCapability: null,
        futureImplementation: null,
        evidence: { rating: ttfb.rating },
      };
    },
  }),
  defineAudit({
    id: 'duplicate-resources',
    lighthouseId: 'duplicate-resources',
    category: 'network',
    subcategory: 'payload',
    title: 'Avoid duplicate network requests',
    description: 'Detects duplicate resource URLs in performance entries.',
    severity: 'Medium',
    weight: 4,
    group: 'A',
    supportLevel: 'full',
    documentationRef: `${LIGHTHOUSE_DOCS_BASE}/performance/`,
    relatedResources: [],
    fixStrategy: 'Deduplicate resource requests.',
    run({ audit }) {
      const count = audit.resources.duplicateResources.length;
      return {
        status: count === 0 ? 'pass' : 'fail',
        pass: count === 0,
        confidence: 'high',
        currentValue: count,
        expectedValue: 0,
        threshold: '0 duplicate URLs',
        unsupportedReason: null,
        missingCapability: null,
        futureImplementation: null,
        evidence: { duplicates: audit.resources.duplicateResources.slice(0, 10) },
      };
    },
  }),
  defineAudit({
    id: 'slow-resources',
    lighthouseId: 'slow-resources',
    category: 'network',
    subcategory: 'latency',
    title: 'Slow network requests',
    description: 'Counts resources exceeding slow threshold.',
    severity: 'Medium',
    weight: 5,
    group: 'A',
    supportLevel: 'full',
    documentationRef: `${LIGHTHOUSE_DOCS_BASE}/performance/`,
    relatedResources: [],
    fixStrategy: 'Optimize or defer slow resources.',
    run({ audit }) {
      const count = audit.resources.slowResources.length;
      const pass = count <= ENTERPRISE_AUDIT_THRESHOLDS.slowResourceCount;
      return {
        status: pass ? 'pass' : 'fail',
        pass,
        confidence: 'high',
        currentValue: count,
        expectedValue: 0,
        threshold: `≤ ${ENTERPRISE_AUDIT_THRESHOLDS.slowResourceCount} slow resources`,
        unsupportedReason: null,
        missingCapability: null,
        futureImplementation: null,
        evidence: { slow: audit.resources.slowResources.slice(0, 10) },
      };
    },
  }),
  defineAudit({
    id: 'resource-summary',
    lighthouseId: 'resource-summary',
    category: 'network',
    subcategory: 'diagnostics',
    title: 'Resource summary',
    description: 'Reports total request count and transfer size.',
    severity: 'Info',
    weight: 0,
    group: 'A',
    supportLevel: 'full',
    documentationRef: `${LIGHTHOUSE_DOCS_BASE}/performance/`,
    relatedResources: [],
    fixStrategy: null,
    run({ audit }) {
      return {
        status: 'pass',
        pass: true,
        confidence: 'high',
        currentValue: audit.resources.totalRequests,
        expectedValue: null,
        threshold: null,
        unsupportedReason: null,
        missingCapability: null,
        futureImplementation: null,
        evidence: {
          totalTransferSize: audit.resources.totalTransferSize,
          byInitiatorType: audit.resources.byInitiatorType,
        },
      };
    },
  }),
  defineAudit({
    id: 'cached-resources',
    lighthouseId: 'uses-long-cache-ttl',
    category: 'network',
    subcategory: 'caching',
    title: 'Cached resource detection',
    description: 'Counts resources served from cache via transfer size heuristic.',
    severity: 'Info',
    weight: 2,
    group: 'B',
    supportLevel: 'partial',
    limitations: ['Cannot read Cache-Control headers', 'transferSize heuristic only'],
    documentationRef: `${LIGHTHOUSE_DOCS_BASE}/performance/uses-long-cache-ttl`,
    relatedResources: [],
    fixStrategy: 'Configure long cache TTLs for static assets.',
    run({ audit }) {
      const cached = audit.resources.cachedResources.length;
      const total = audit.resources.totalRequests;
      return {
        status: 'pass',
        pass: true,
        confidence: 'low',
        currentValue: cached,
        expectedValue: total,
        threshold: 'cache heuristic',
        unsupportedReason: null,
        missingCapability: null,
        futureImplementation: null,
        evidence: { cached, total },
      };
    },
  }),
];
