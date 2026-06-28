import {
  ENTERPRISE_AUDIT_THRESHOLDS,
  LIGHTHOUSE_DOCS_BASE,
} from '@features/enterprise-audit/config/thresholds';
import type { RunnableAudit } from '@features/enterprise-audit/types/audit';
import { defineAudit } from '@features/enterprise-audit/utils/auditHelpers';

export const securityAudits: RunnableAudit[] = [
  defineAudit({
    id: 'csp-meta',
    lighthouseId: 'csp-xss',
    category: 'security',
    subcategory: 'csp',
    title: 'Content Security Policy (meta)',
    description: 'Checks for CSP meta tag as best-effort indicator.',
    severity: 'High',
    weight: 7,
    group: 'B',
    supportLevel: 'partial',
    limitations: ['Meta CSP only', 'Cannot evaluate header CSP strength'],
    documentationRef: `${LIGHTHOUSE_DOCS_BASE}/best-practices/csp-xss`,
    relatedResources: [],
    fixStrategy: 'Implement a strong Content-Security-Policy.',
    run({ audit }) {
      const hasMeta = audit.security.hasCspMeta;
      const hasHeader = audit.security.responseHeaders.contentSecurityPolicy === 'present';
      const pass = hasMeta || hasHeader;
      return {
        status: pass ? 'pass' : 'fail',
        pass,
        confidence: audit.security.headerFetchSucceeded ? 'medium' : 'low',
        currentValue: hasHeader ? 'header' : hasMeta ? 'meta' : 'none',
        expectedValue: 'CSP present',
        threshold: 'CSP header or meta',
        unsupportedReason: null,
        missingCapability: null,
        futureImplementation: null,
        evidence: {
          cspMeta: audit.security.cspMetaContent,
          header: audit.security.responseHeaders.contentSecurityPolicy,
        },
      };
    },
  }),
  defineAudit({
    id: 'x-content-type-options',
    lighthouseId: 'x-content-type-options',
    category: 'security',
    subcategory: 'headers',
    title: 'X-Content-Type-Options header',
    description: 'Checks for nosniff header on document response.',
    severity: 'Medium',
    weight: 5,
    group: 'B',
    supportLevel: 'partial',
    limitations: ['Requires successful HEAD fetch', 'CORS may block cross-origin'],
    documentationRef: 'https://developer.mozilla.org/docs/Web/HTTP/Headers/X-Content-Type-Options',
    relatedResources: [],
    fixStrategy: 'Set X-Content-Type-Options: nosniff.',
    run({ audit }) {
      if (!audit.security.headerFetchSucceeded) {
        return {
          status: 'skipped',
          pass: false,
          confidence: 'low',
          currentValue: null,
          expectedValue: 'nosniff',
          threshold: 'header present',
          unsupportedReason: null,
          missingCapability: null,
          futureImplementation: null,
          evidence: { error: audit.security.headerFetchError },
        };
      }
      const pass = audit.security.responseHeaders.xContentTypeOptions === 'present';
      return {
        status: pass ? 'pass' : 'fail',
        pass,
        confidence: 'medium',
        currentValue: audit.security.responseHeaders.xContentTypeOptions,
        expectedValue: 'present',
        threshold: 'X-Content-Type-Options: nosniff',
        unsupportedReason: null,
        missingCapability: null,
        futureImplementation: null,
        evidence: {},
      };
    },
  }),
  defineAudit({
    id: 'referrer-policy',
    lighthouseId: 'referrer-policy',
    category: 'security',
    subcategory: 'headers',
    title: 'Referrer-Policy header',
    description: 'Checks Referrer-Policy response header.',
    severity: 'Low',
    weight: 3,
    group: 'B',
    supportLevel: 'partial',
    limitations: ['HEAD fetch may fail on cross-origin'],
    documentationRef: 'https://developer.mozilla.org/docs/Web/HTTP/Headers/Referrer-Policy',
    relatedResources: [],
    fixStrategy: 'Set an appropriate Referrer-Policy.',
    run({ audit }) {
      if (!audit.security.headerFetchSucceeded) {
        return {
          status: 'skipped',
          pass: false,
          confidence: 'low',
          currentValue: null,
          expectedValue: 'present',
          threshold: 'header present',
          unsupportedReason: null,
          missingCapability: null,
          futureImplementation: null,
          evidence: {},
        };
      }
      const pass = audit.security.responseHeaders.referrerPolicy === 'present';
      return {
        status: pass ? 'pass' : 'fail',
        pass,
        confidence: 'medium',
        currentValue: audit.security.responseHeaders.referrerPolicy,
        expectedValue: 'present',
        threshold: 'Referrer-Policy header',
        unsupportedReason: null,
        missingCapability: null,
        futureImplementation: null,
        evidence: {},
      };
    },
  }),
  defineAudit({
    id: 'cross-origin-isolated',
    lighthouseId: 'is-origin-isolated',
    category: 'security',
    subcategory: 'isolation',
    title: 'Cross-origin isolated',
    description: 'Checks window.crossOriginIsolated flag.',
    severity: 'Low',
    weight: 2,
    group: 'B',
    supportLevel: 'partial',
    limitations: ['Flag only', 'Does not validate COOP/COEP headers directly'],
    documentationRef: `${LIGHTHOUSE_DOCS_BASE}/best-practices/is-origin-isolated`,
    relatedResources: [],
    fixStrategy: 'Enable COOP and COEP headers.',
    run({ audit }) {
      return {
        status: 'pass',
        pass: audit.security.crossOriginIsolated,
        confidence: 'high',
        currentValue: audit.security.crossOriginIsolated,
        expectedValue: true,
        threshold: 'crossOriginIsolated === true',
        unsupportedReason: null,
        missingCapability: null,
        futureImplementation: null,
        evidence: {
          coop: audit.security.responseHeaders.crossOriginOpenerPolicy,
          coep: audit.security.responseHeaders.crossOriginEmbedderPolicy,
        },
      };
    },
  }),
  defineAudit({
    id: 'cookie-security',
    lighthouseId: 'cookie-security',
    category: 'security',
    subcategory: 'cookies',
    title: 'Visible cookies use Secure flag',
    description: 'Checks document.cookie visible cookies for Secure attribute.',
    severity: 'Medium',
    weight: 4,
    group: 'B',
    supportLevel: 'partial',
    limitations: ['HttpOnly cookies not visible to content scripts'],
    documentationRef: 'https://developer.mozilla.org/docs/Web/HTTP/Cookies',
    relatedResources: [],
    fixStrategy: 'Set Secure and HttpOnly on sensitive cookies.',
    run({ audit }) {
      if (!audit.security.isHttps) {
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
      const insecure = audit.security.visibleInsecureCookieFlags;
      return {
        status: insecure === 0 ? 'pass' : 'fail',
        pass: insecure === 0,
        confidence: 'low',
        currentValue: insecure,
        expectedValue: 0,
        threshold: '0 visible cookies without Secure',
        unsupportedReason: null,
        missingCapability: null,
        futureImplementation: null,
        evidence: { cookieCount: audit.security.cookieCount },
      };
    },
  }),
  defineAudit({
    id: 'too-many-cookies',
    lighthouseId: 'cookie-count',
    category: 'security',
    subcategory: 'cookies',
    title: 'Cookie count within limits',
    description: 'Measures visible cookie count.',
    severity: 'Low',
    weight: 3,
    group: 'A',
    supportLevel: 'full',
    documentationRef: 'https://developer.chrome.com/docs/lighthouse/best-practices/',
    relatedResources: [],
    fixStrategy: 'Reduce unnecessary cookies.',
    run({ audit }) {
      const count = audit.storage.cookies.count;
      const pass = count <= ENTERPRISE_AUDIT_THRESHOLDS.cookieCount;
      return {
        status: pass ? 'pass' : 'fail',
        pass,
        confidence: 'medium',
        currentValue: count,
        expectedValue: ENTERPRISE_AUDIT_THRESHOLDS.cookieCount,
        threshold: `≤ ${ENTERPRISE_AUDIT_THRESHOLDS.cookieCount} cookies`,
        unsupportedReason: null,
        missingCapability: null,
        futureImplementation: null,
        evidence: {},
      };
    },
  }),
];
