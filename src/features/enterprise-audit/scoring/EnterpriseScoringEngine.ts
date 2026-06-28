import {
  ENTERPRISE_CATEGORY_LABELS,
  ENTERPRISE_CATEGORY_WEIGHTS,
} from '@features/enterprise-audit/config/weights';
import type { EnterpriseAuditReport } from '@features/enterprise-audit/types/audit';
import type { AuditCategory } from '@features/enterprise-audit/types/audit';

export interface EnterpriseCategoryScore {
  category: AuditCategory;
  label: string;
  score: number;
  weight: number;
  maxAchievableScore: number;
  coveragePercent: number;
  confidenceScore: number;
  pointsLost: number;
  scoreExplanation: string;
  passedAudits: string[];
  failedAudits: Array<{ id: string; title: string; weight: number; fixImpact: number }>;
  unsupportedAudits: string[];
}

export interface EnterpriseScoreResult {
  generatedAt: number;
  overallScore: number;
  maxAchievableScore: number;
  coveragePercent: number;
  confidenceScore: number;
  grade: string;
  categories: EnterpriseCategoryScore[];
  scoreExplanation: string;
  improvementPotential: Array<{
    auditId: string;
    title: string;
    weight: number;
    category: AuditCategory;
  }>;
}

export class EnterpriseScoringEngine {
  score(report: EnterpriseAuditReport): EnterpriseScoreResult {
    const categories = (Object.keys(ENTERPRISE_CATEGORY_WEIGHTS) as AuditCategory[]).map(
      (category) => this.scoreCategory(category, report),
    );

    const overallScore = Math.round(
      categories.reduce((sum, cat) => sum + cat.score * cat.weight, 0),
    );

    const maxAchievableScore = Math.round(
      categories.reduce((sum, cat) => sum + cat.maxAchievableScore * cat.weight, 0),
    );

    const failedWeighted = report.results.filter((r) => r.status === 'fail' && r.weight > 0);

    return {
      generatedAt: Date.now(),
      overallScore,
      maxAchievableScore,
      coveragePercent: report.summary.coveragePercent,
      confidenceScore: report.summary.confidenceScore,
      grade: scoreToGrade(overallScore),
      categories,
      scoreExplanation: `Overall ${overallScore}/100 (max achievable ${maxAchievableScore} given ${report.summary.unsupported} unsupported Lighthouse audits). Coverage ${report.summary.coveragePercent}%.`,
      improvementPotential: failedWeighted
        .sort((a, b) => b.weight - a.weight)
        .map((r) => ({
          auditId: r.id,
          title: r.title,
          weight: r.weight,
          category: r.category,
        })),
    };
  }

  private scoreCategory(
    category: AuditCategory,
    report: EnterpriseAuditReport,
  ): EnterpriseCategoryScore {
    const summary = report.summary.byCategory[category];
    const categoryResults = report.results.filter((r) => r.category === category);

    return {
      category,
      label: ENTERPRISE_CATEGORY_LABELS[category],
      score: summary.weightedScore,
      weight: ENTERPRISE_CATEGORY_WEIGHTS[category],
      maxAchievableScore: summary.maxAchievableScore,
      coveragePercent: summary.coveragePercent,
      confidenceScore: summary.confidenceScore,
      pointsLost: summary.pointsLost,
      scoreExplanation: summary.scoreExplanation,
      passedAudits: categoryResults.filter((r) => r.status === 'pass').map((r) => r.title),
      failedAudits: categoryResults
        .filter((r) => r.status === 'fail')
        .map((r) => ({
          id: r.id,
          title: r.title,
          weight: r.weight,
          fixImpact: r.weight,
        })),
      unsupportedAudits: categoryResults
        .filter((r) => r.status === 'unsupported')
        .map((r) => r.title),
    };
  }
}

function scoreToGrade(score: number): string {
  if (score >= 95) return 'A+';
  if (score >= 90) return 'A';
  if (score >= 80) return 'B';
  if (score >= 70) return 'C';
  if (score >= 60) return 'D';
  return 'F';
}

export const enterpriseScoringEngine = new EnterpriseScoringEngine();
