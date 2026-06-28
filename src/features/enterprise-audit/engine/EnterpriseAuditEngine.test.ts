import { describe, expect, it } from 'vitest';
import { enterpriseAuditEngine } from '@features/enterprise-audit';
import { AUDIT_INVENTORY_STATS } from '@features/enterprise-audit';
import { createEmptyAuditResult } from '@content/collectors/defaults';

describe('EnterpriseAuditEngine', () => {
  it('runs all inventory audits without throwing', () => {
    const audit = createEmptyAuditResult();
    audit.meta.url = 'https://example.com';
    audit.security.isHttps = true;
    audit.metaTags.title = 'Example';
    audit.accessibility.hasLangAttribute = true;

    const report = enterpriseAuditEngine.runAll(audit);

    expect(report.results.length).toBe(AUDIT_INVENTORY_STATS.totalReviewed);
    expect(report.summary.total).toBe(AUDIT_INVENTORY_STATS.totalReviewed);
    expect(report.summary.unsupported).toBeGreaterThan(0);
  });

  it('marks unsupported audits without faking pass results', () => {
    const report = enterpriseAuditEngine.runAll(createEmptyAuditResult());
    const speedIndex = report.results.find((r) => r.id === 'speed-index');
    expect(speedIndex?.status).toBe('unsupported');
    expect(speedIndex?.pass).toBe(false);
    expect(speedIndex?.missingCapability).toBeTruthy();
  });
});
