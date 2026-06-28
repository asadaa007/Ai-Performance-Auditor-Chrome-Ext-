export type ScoreCategory = 'performance' | 'accessibility' | 'seo' | 'bestPractices' | 'security';

export type ScoreGrade = 'A+' | 'A' | 'B' | 'C' | 'D' | 'F';

export type HealthLabel = 'Excellent' | 'Great' | 'Good' | 'Fair' | 'Needs Improvement';

export interface ScoreRuleContribution {
  ruleId: string;
  title: string;
  penalty: number;
}

export interface ScorePositiveFinding {
  ruleId: string;
  title: string;
}

export interface CategoryScore {
  category: ScoreCategory;
  label: string;
  score: number;
  weight: number;
  negativeFindings: ScoreRuleContribution[];
  positiveFindings: ScorePositiveFinding[];
  calculation: string;
}

export interface OverallScore {
  score: number;
  grade: ScoreGrade;
  label: HealthLabel;
  weightedCategories: CategoryScore[];
}

export interface ScoreResult {
  generatedAt: number;
  overall: OverallScore;
  categories: CategoryScore[];
  criticalCount: number;
  warningCount: number;
  passedCount: number;
  estimatedImprovementPotential: number;
}
