import { RUNNABLE_AUDITS } from '@features/enterprise-audit/registry/AuditRegistry';
import { UNSUPPORTED_LIGHTHOUSE_AUDITS } from '@features/enterprise-audit/inventory/unsupported-audits';
import type {
  AuditCategory,
  AuditContext,
  CategoryAuditSummary,
  EnterpriseAuditReport,
} from '@features/enterprise-audit/types/audit';
import {
  createUnsupportedResult,
  finalizeAuditResult,
} from '@features/enterprise-audit/utils/auditHelpers';

const CATEGORIES: AuditCategory[] = [
  'performance',
  'accessibility',
  'seo',
  'best-practices',
  'security',
  'network',
];

export class EnterpriseAuditEngine {
  runAll(audit: AuditContext['audit']): EnterpriseAuditReport {
    const context: AuditContext = { audit };
    const started = performance.now();
    const results = [
      ...RUNNABLE_AUDITS.map((definition) => this.runAudit(definition, context)),
      ...UNSUPPORTED_LIGHTHOUSE_AUDITS.map((definition) => createUnsupportedResult(definition)),
    ];

    const summary = this.buildSummary(results);
    const lighthouseComparison = {
      totalLighthouseAudits: RUNNABLE_AUDITS.length + UNSUPPORTED_LIGHTHOUSE_AUDITS.length,
      groupA: RUNNABLE_AUDITS.filter((a) => a.group === 'A').length,
      groupB: RUNNABLE_AUDITS.filter((a) => a.group === 'B').length,
      groupC: UNSUPPORTED_LIGHTHOUSE_AUDITS.length,
      implementedFull: results.filter((r) => r.supportLevel === 'full').length,
      implementedPartial: results.filter((r) => r.supportLevel === 'partial').length,
      unsupported: results.filter((r) => r.status === 'unsupported').length,
      coveragePercent: Math.round(
        (results.filter((r) => r.status !== 'unsupported').length /
          (RUNNABLE_AUDITS.length + UNSUPPORTED_LIGHTHOUSE_AUDITS.length)) *
          100,
      ),
    };

    return {
      auditedAt: Date.now(),
      auditUrl: audit.meta.url,
      collectionDurationMs:
        Math.round(performance.now() - started) + audit.meta.collectionDurationMs,
      results,
      summary,
      lighthouseComparison,
    };
  }

  private runAudit(definition: (typeof RUNNABLE_AUDITS)[number], context: AuditContext) {
    const started = performance.now();
    try {
      const partial = definition.run(context);
      return finalizeAuditResult(definition, partial, Math.round(performance.now() - started));
    } catch (error) {
      return finalizeAuditResult(
        definition,
        {
          status: 'fail',
          pass: false,
          confidence: 'low',
          currentValue: null,
          expectedValue: null,
          threshold: null,
          unsupportedReason: null,
          missingCapability: null,
          futureImplementation: null,
          evidence: {
            error: error instanceof Error ? error.message : String(error),
          },
        },
        Math.round(performance.now() - started),
      );
    }
  }

  private buildSummary(
    results: EnterpriseAuditReport['results'],
  ): EnterpriseAuditReport['summary'] {
    const byCategory = CATEGORIES.reduce<Record<AuditCategory, CategoryAuditSummary>>(
      (acc, category) => {
        acc[category] = this.summarizeCategory(category, results);
        return acc;
      },
      {} as Record<AuditCategory, CategoryAuditSummary>,
    );

    const applicable = results.filter((r) => r.status !== 'unsupported' && r.status !== 'skipped');
    const confidenceScore =
      applicable.length === 0
        ? 0
        : Math.round(
            (applicable.reduce((sum, r) => sum + confidenceToScore(r.confidence), 0) /
              applicable.length) *
              100,
          ) / 100;

    return {
      total: results.length,
      passed: results.filter((r) => r.status === 'pass').length,
      failed: results.filter((r) => r.status === 'fail').length,
      skipped: results.filter((r) => r.status === 'skipped').length,
      unsupported: results.filter((r) => r.status === 'unsupported').length,
      partial: results.filter((r) => r.supportLevel === 'partial').length,
      coveragePercent: Math.round(
        ((results.length - results.filter((r) => r.status === 'unsupported').length) /
          results.length) *
          100,
      ),
      confidenceScore,
      byCategory,
    };
  }

  private summarizeCategory(
    category: AuditCategory,
    results: EnterpriseAuditReport['results'],
  ): CategoryAuditSummary {
    const categoryResults = results.filter((r) => r.category === category);
    const applicable = categoryResults.filter((r) => r.status !== 'unsupported' && r.weight > 0);
    const passedWeight = applicable.filter((r) => r.pass).reduce((s, r) => s + r.weight, 0);
    const totalWeight = applicable.reduce((s, r) => s + r.weight, 0);
    const maxAchievableScore = totalWeight > 0 ? 100 : 0;
    const weightedScore = totalWeight > 0 ? Math.round((passedWeight / totalWeight) * 100) : 100;
    const pointsLost = totalWeight - passedWeight;

    const failedAudits = applicable.filter((r) => !r.pass && r.status === 'fail');
    const scoreExplanation =
      totalWeight === 0
        ? 'No weighted audits in this category.'
        : `Score ${weightedScore}/100. Lost ${pointsLost} weight points from: ${failedAudits.map((a) => `${a.title} (-${a.weight})`).join(', ') || 'none'}.`;

    return {
      category,
      total: categoryResults.length,
      passed: categoryResults.filter((r) => r.status === 'pass').length,
      failed: categoryResults.filter((r) => r.status === 'fail').length,
      skipped: categoryResults.filter((r) => r.status === 'skipped').length,
      unsupported: categoryResults.filter((r) => r.status === 'unsupported').length,
      partial: categoryResults.filter((r) => r.supportLevel === 'partial').length,
      implemented: categoryResults.filter((r) => r.supportLevel !== 'unsupported').length,
      coveragePercent:
        categoryResults.length === 0
          ? 0
          : Math.round(
              ((categoryResults.length -
                categoryResults.filter((r) => r.status === 'unsupported').length) /
                categoryResults.length) *
                100,
            ),
      confidenceScore:
        applicable.length === 0
          ? 0
          : Math.round(
              (applicable.reduce((s, r) => s + confidenceToScore(r.confidence), 0) /
                applicable.length) *
                100,
            ) / 100,
      weightedScore,
      maxAchievableScore,
      pointsLost,
      scoreExplanation,
    };
  }
}

function confidenceToScore(confidence: 'high' | 'medium' | 'low'): number {
  if (confidence === 'high') return 1;
  if (confidence === 'medium') return 0.75;
  return 0.5;
}

export const enterpriseAuditEngine = new EnterpriseAuditEngine();
