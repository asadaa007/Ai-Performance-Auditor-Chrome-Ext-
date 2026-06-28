import {
  CATEGORY_LABELS,
  CATEGORY_WEIGHTS,
  RULE_SCORE_WEIGHTS,
  SCORE_CATEGORY_RULES,
} from '@features/scoring/config/ruleWeights';
import type {
  CategoryScore,
  HealthLabel,
  OverallScore,
  ScoreCategory,
  ScoreGrade,
  ScoreResult,
} from '@features/scoring/types/score';
import type { AnalysisResult } from '@features/analysis';
import type { IssueSeverity } from '@features/analysis/types';

export class ScoringEngine {
  score(analysis: AnalysisResult): ScoreResult {
    const triggered = new Map(analysis.issues.map((issue) => [issue.id, issue]));
    const categories = (Object.keys(CATEGORY_WEIGHTS) as ScoreCategory[]).map((category) =>
      this.scoreCategory(category, triggered),
    );

    const overallScore = this.calculateOverall(categories);
    const criticalCount = analysis.issues.filter(
      (issue) => issue.severity === 'Critical' || issue.severity === 'High',
    ).length;
    const warningCount = analysis.issues.filter((issue) => issue.severity === 'Medium').length;
    const passedCount = this.countPassedRules(triggered);
    const estimatedImprovementPotential = categories.reduce(
      (sum, category) =>
        sum + category.negativeFindings.reduce((penalty, finding) => penalty + finding.penalty, 0),
      0,
    );

    return {
      generatedAt: Date.now(),
      overall: overallScore,
      categories,
      criticalCount,
      warningCount,
      passedCount,
      estimatedImprovementPotential: Math.min(100, estimatedImprovementPotential),
    };
  }

  private scoreCategory(
    category: ScoreCategory,
    triggered: Map<string, { id: string; title: string; severity: IssueSeverity }>,
  ): CategoryScore {
    const ruleIds = SCORE_CATEGORY_RULES[category];
    const negativeFindings = ruleIds
      .filter((ruleId) => triggered.has(ruleId))
      .map((ruleId) => {
        const config = RULE_SCORE_WEIGHTS[ruleId];
        const issue = triggered.get(ruleId)!;
        return {
          ruleId,
          title: issue.title || config.title,
          penalty: config.penalty,
        };
      });

    const positiveFindings = ruleIds
      .filter((ruleId) => !triggered.has(ruleId))
      .map((ruleId) => ({
        ruleId,
        title: RULE_SCORE_WEIGHTS[ruleId].title,
      }));

    const totalPenalty = negativeFindings.reduce((sum, finding) => sum + finding.penalty, 0);
    const score = Math.max(0, Math.round(100 - totalPenalty));
    const calculation = `100 - ${negativeFindings.map((f) => f.penalty).join(' - ') || '0'} = ${score}`;

    return {
      category,
      label: CATEGORY_LABELS[category],
      score,
      weight: CATEGORY_WEIGHTS[category],
      negativeFindings,
      positiveFindings,
      calculation,
    };
  }

  private calculateOverall(categories: CategoryScore[]): OverallScore {
    const weightedScore = categories.reduce(
      (sum, category) => sum + category.score * category.weight,
      0,
    );
    const score = Math.round(weightedScore);

    return {
      score,
      grade: scoreToGrade(score),
      label: scoreToHealthLabel(score),
      weightedCategories: categories,
    };
  }

  private countPassedRules(triggered: Map<string, unknown>): number {
    return Object.keys(RULE_SCORE_WEIGHTS).filter((ruleId) => !triggered.has(ruleId)).length;
  }
}

export function scoreToGrade(score: number): ScoreGrade {
  if (score >= 95) return 'A+';
  if (score >= 90) return 'A';
  if (score >= 80) return 'B';
  if (score >= 70) return 'C';
  if (score >= 60) return 'D';
  return 'F';
}

export function scoreToHealthLabel(score: number): HealthLabel {
  if (score >= 95) return 'Excellent';
  if (score >= 90) return 'Great';
  if (score >= 80) return 'Good';
  if (score >= 70) return 'Fair';
  return 'Needs Improvement';
}

export function scoreTone(score: number): 'success' | 'warning' | 'danger' | 'neutral' | 'accent' {
  if (score >= 90) return 'success';
  if (score >= 80) return 'accent';
  if (score >= 70) return 'warning';
  return 'danger';
}

export const scoringEngine = new ScoringEngine();
