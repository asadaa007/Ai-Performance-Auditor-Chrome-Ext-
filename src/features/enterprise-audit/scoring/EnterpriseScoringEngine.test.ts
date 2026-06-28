import { describe, expect, it } from 'vitest';
import { enterpriseAuditEngine, enterpriseScoringEngine } from '@features/enterprise-audit';
import { createEmptyAuditResult } from '@content/collectors/defaults';

describe('EnterpriseScoringEngine', () => {
  it('does not assign 100 when audits fail', () => {
    const audit = createEmptyAuditResult();
    audit.meta.url = 'http://insecure.example.com';
    audit.security.isHttps = false;
    audit.security.pageProtocol = 'http:';

    const report = enterpriseAuditEngine.runAll(audit);
    const score = enterpriseScoringEngine.score(report);

    expect(score.overallScore).toBeLessThan(100);
    expect(score.improvementPotential.length).toBeGreaterThan(0);
    expect(score.scoreExplanation).toContain('max achievable');
  });

  it('explains points lost per category', () => {
    const audit = createEmptyAuditResult();
    const report = enterpriseAuditEngine.runAll(audit);
    const score = enterpriseScoringEngine.score(report);

    const performance = score.categories.find((c) => c.category === 'performance');
    expect(performance?.scoreExplanation).toBeTruthy();
    expect(performance?.maxAchievableScore).toBeDefined();
  });

  it('tracks coverage and confidence', () => {
    const report = enterpriseAuditEngine.runAll(createEmptyAuditResult());
    const score = enterpriseScoringEngine.score(report);

    expect(score.coveragePercent).toBeGreaterThan(0);
    expect(score.coveragePercent).toBeLessThanOrEqual(100);
    expect(report.summary.confidenceScore).toBeGreaterThanOrEqual(0);
  });
});
