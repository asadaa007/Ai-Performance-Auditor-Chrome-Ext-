import {
  ENTERPRISE_AUDIT_THRESHOLDS,
  LIGHTHOUSE_DOCS_BASE,
} from '@features/enterprise-audit/config/thresholds';
import type { RunnableAudit } from '@features/enterprise-audit/types/audit';
import { defineAudit } from '@features/enterprise-audit/utils/auditHelpers';

export const seoAudits: RunnableAudit[] = [
  defineAudit({
    id: 'meta-description',
    lighthouseId: 'meta-description',
    category: 'seo',
    subcategory: 'content',
    title: 'Document has a meta description',
    description: 'Checks for meta description tag.',
    severity: 'High',
    weight: 8,
    group: 'A',
    supportLevel: 'full',
    documentationRef: `${LIGHTHOUSE_DOCS_BASE}/seo/meta-description`,
    relatedResources: [],
    fixStrategy: 'Add a unique meta description.',
    run({ audit }) {
      const desc = audit.metaTags.description?.trim() ?? '';
      const pass = desc.length > 0;
      return {
        status: pass ? 'pass' : 'fail',
        pass,
        confidence: 'high',
        currentValue: desc.length,
        expectedValue: ENTERPRISE_AUDIT_THRESHOLDS.descriptionMinLength,
        threshold: 'non-empty description',
        unsupportedReason: null,
        missingCapability: null,
        futureImplementation: null,
        evidence: { description: audit.metaTags.description },
      };
    },
  }),
  defineAudit({
    id: 'meta-description-length',
    lighthouseId: 'meta-description',
    category: 'seo',
    subcategory: 'content',
    title: 'Meta description length is optimal',
    description: 'Validates meta description character count.',
    severity: 'Low',
    weight: 3,
    group: 'A',
    supportLevel: 'full',
    documentationRef: `${LIGHTHOUSE_DOCS_BASE}/seo/meta-description`,
    relatedResources: [],
    fixStrategy: 'Keep description between 50-160 characters.',
    run({ audit }) {
      const len = audit.seo.descriptionLength;
      const pass =
        len >= ENTERPRISE_AUDIT_THRESHOLDS.descriptionMinLength &&
        len <= ENTERPRISE_AUDIT_THRESHOLDS.descriptionMaxLength;
      return {
        status: len === 0 ? 'skipped' : pass ? 'pass' : 'fail',
        pass,
        confidence: 'high',
        currentValue: len,
        expectedValue: ENTERPRISE_AUDIT_THRESHOLDS.descriptionMaxLength,
        threshold: `${ENTERPRISE_AUDIT_THRESHOLDS.descriptionMinLength}-${ENTERPRISE_AUDIT_THRESHOLDS.descriptionMaxLength} chars`,
        unsupportedReason: null,
        missingCapability: null,
        futureImplementation: null,
        evidence: {},
      };
    },
  }),
  defineAudit({
    id: 'document-title-length',
    lighthouseId: 'document-title',
    category: 'seo',
    subcategory: 'content',
    title: 'Document title length is optimal',
    description: 'Validates title character count for SEO.',
    severity: 'Low',
    weight: 3,
    group: 'A',
    supportLevel: 'full',
    documentationRef: `${LIGHTHOUSE_DOCS_BASE}/seo/title`,
    relatedResources: [],
    fixStrategy: 'Keep title between 10-60 characters.',
    run({ audit }) {
      const len = audit.seo.titleLength;
      const pass =
        len >= ENTERPRISE_AUDIT_THRESHOLDS.titleMinLength &&
        len <= ENTERPRISE_AUDIT_THRESHOLDS.titleMaxLength;
      return {
        status: len === 0 ? 'fail' : pass ? 'pass' : 'fail',
        pass,
        confidence: 'high',
        currentValue: len,
        expectedValue: ENTERPRISE_AUDIT_THRESHOLDS.titleMaxLength,
        threshold: `${ENTERPRISE_AUDIT_THRESHOLDS.titleMinLength}-${ENTERPRISE_AUDIT_THRESHOLDS.titleMaxLength} chars`,
        unsupportedReason: null,
        missingCapability: null,
        futureImplementation: null,
        evidence: { title: audit.metaTags.title },
      };
    },
  }),
  defineAudit({
    id: 'canonical',
    lighthouseId: 'canonical',
    category: 'seo',
    subcategory: 'crawlability',
    title: 'Document has a valid canonical URL',
    description: 'Checks for canonical link element.',
    severity: 'Medium',
    weight: 5,
    group: 'A',
    supportLevel: 'full',
    documentationRef: `${LIGHTHOUSE_DOCS_BASE}/seo/canonical`,
    relatedResources: [],
    fixStrategy: 'Add a canonical link element.',
    run({ audit }) {
      const pass = Boolean(audit.metaTags.canonicalUrl);
      return {
        status: pass ? 'pass' : 'fail',
        pass,
        confidence: 'high',
        currentValue: audit.metaTags.canonicalUrl,
        expectedValue: 'canonical URL',
        threshold: 'canonical link present',
        unsupportedReason: null,
        missingCapability: null,
        futureImplementation: null,
        evidence: { canonical: audit.metaTags.canonicalUrl },
      };
    },
  }),
  defineAudit({
    id: 'meta-viewport',
    lighthouseId: 'viewport',
    category: 'seo',
    subcategory: 'mobile',
    title: 'Has a <meta name="viewport"> tag',
    description: 'Checks for mobile viewport meta tag.',
    severity: 'High',
    weight: 8,
    group: 'A',
    supportLevel: 'full',
    documentationRef: `${LIGHTHOUSE_DOCS_BASE}/seo/viewport`,
    relatedResources: [],
    fixStrategy: 'Add width=device-width viewport meta.',
    run({ audit }) {
      const pass = Boolean(audit.metaTags.viewport);
      return {
        status: pass ? 'pass' : 'fail',
        pass,
        confidence: 'high',
        currentValue: audit.metaTags.viewport,
        expectedValue: 'width=device-width',
        threshold: 'viewport meta present',
        unsupportedReason: null,
        missingCapability: null,
        futureImplementation: null,
        evidence: {},
      };
    },
  }),
  defineAudit({
    id: 'is-crawlable',
    lighthouseId: 'is-crawlable',
    category: 'seo',
    subcategory: 'crawlability',
    title: 'Page isn’t blocked from indexing',
    description: 'Checks robots meta for noindex.',
    severity: 'Critical',
    weight: 10,
    group: 'A',
    supportLevel: 'full',
    documentationRef: `${LIGHTHOUSE_DOCS_BASE}/seo/is-crawlable`,
    relatedResources: [],
    fixStrategy: 'Remove noindex if page should be indexed.',
    run({ audit }) {
      const pass = !audit.seo.hasNoindex;
      return {
        status: pass ? 'pass' : 'fail',
        pass,
        confidence: 'high',
        currentValue: audit.metaTags.robots,
        expectedValue: 'indexable',
        threshold: 'no noindex directive',
        unsupportedReason: null,
        missingCapability: null,
        futureImplementation: null,
        evidence: { robots: audit.metaTags.robots },
      };
    },
  }),
  defineAudit({
    id: 'robots-txt',
    lighthouseId: 'robots-txt',
    category: 'seo',
    subcategory: 'crawlability',
    title: 'robots.txt is valid',
    description: 'Fetches and validates robots.txt availability.',
    severity: 'Medium',
    weight: 4,
    group: 'B',
    supportLevel: 'partial',
    limitations: ['Does not parse robots.txt rules for this URL'],
    documentationRef: `${LIGHTHOUSE_DOCS_BASE}/seo/robots-txt`,
    relatedResources: [],
    fixStrategy: 'Ensure robots.txt is reachable and valid.',
    run({ audit }) {
      if (audit.seo.robotsTxtReachable === null) {
        return {
          status: 'skipped',
          pass: false,
          confidence: 'low',
          currentValue: null,
          expectedValue: 200,
          threshold: 'HTTP 200',
          unsupportedReason: null,
          missingCapability: null,
          futureImplementation: null,
          evidence: {},
        };
      }
      const pass = audit.seo.robotsTxtReachable;
      return {
        status: pass ? 'pass' : 'fail',
        pass,
        confidence: 'medium',
        currentValue: audit.seo.robotsTxtStatus,
        expectedValue: 200,
        threshold: 'robots.txt reachable',
        unsupportedReason: null,
        missingCapability: null,
        futureImplementation: null,
        evidence: { url: audit.seo.robotsTxtUrl, error: audit.seo.robotsTxtError },
      };
    },
  }),
  defineAudit({
    id: 'structured-data',
    lighthouseId: 'structured-data',
    category: 'seo',
    subcategory: 'structured-data',
    title: 'Structured data is valid',
    description: 'Parses JSON-LD blocks on the page.',
    severity: 'Low',
    weight: 3,
    group: 'A',
    supportLevel: 'full',
    documentationRef: `${LIGHTHOUSE_DOCS_BASE}/seo/structured-data`,
    relatedResources: [],
    fixStrategy: 'Fix JSON-LD syntax errors.',
    run({ audit }) {
      const blocks = audit.seo.structuredData;
      if (blocks.length === 0) {
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
      const invalid = blocks.filter((b) => !b.valid);
      return {
        status: invalid.length === 0 ? 'pass' : 'fail',
        pass: invalid.length === 0,
        confidence: 'high',
        currentValue: invalid.length,
        expectedValue: 0,
        threshold: '0 invalid JSON-LD blocks',
        unsupportedReason: null,
        missingCapability: null,
        futureImplementation: null,
        evidence: { blocks },
      };
    },
  }),
  defineAudit({
    id: 'hreflang',
    lighthouseId: 'hreflang',
    category: 'seo',
    subcategory: 'localization',
    title: 'Document has valid hreflang',
    description: 'Checks hreflang alternate links when present.',
    severity: 'Low',
    weight: 2,
    group: 'B',
    supportLevel: 'partial',
    limitations: ['Does not validate reciprocal hreflang links'],
    documentationRef: `${LIGHTHOUSE_DOCS_BASE}/seo/hreflang`,
    relatedResources: [],
    fixStrategy: 'Add valid hreflang alternate links.',
    run({ audit }) {
      const links = audit.seo.hreflangLinks;
      if (links.length === 0) {
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
      const invalid = links.filter((l) => !l.hreflang || !l.href);
      return {
        status: invalid.length === 0 ? 'pass' : 'fail',
        pass: invalid.length === 0,
        confidence: 'medium',
        currentValue: links.length,
        expectedValue: links.length,
        threshold: 'valid hreflang attributes',
        unsupportedReason: null,
        missingCapability: null,
        futureImplementation: null,
        evidence: { links },
      };
    },
  }),
  defineAudit({
    id: 'open-graph',
    lighthouseId: 'open-graph',
    category: 'seo',
    subcategory: 'social',
    title: 'Open Graph meta tags present',
    description: 'Checks for basic Open Graph tags.',
    severity: 'Low',
    weight: 2,
    group: 'A',
    supportLevel: 'full',
    documentationRef: 'https://ogp.me/',
    relatedResources: [],
    fixStrategy: 'Add og:title, og:description, og:image.',
    run({ audit }) {
      const og = audit.metaTags.openGraph;
      const pass = Boolean(og['og:title'] && og['og:description']);
      return {
        status: pass ? 'pass' : 'fail',
        pass,
        confidence: 'high',
        currentValue: Object.keys(og).length,
        expectedValue: 2,
        threshold: 'og:title and og:description',
        unsupportedReason: null,
        missingCapability: null,
        futureImplementation: null,
        evidence: { openGraph: og },
      };
    },
  }),
];
