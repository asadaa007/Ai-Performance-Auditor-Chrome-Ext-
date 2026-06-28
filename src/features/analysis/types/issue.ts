export type IssueCategory =
  | 'Performance'
  | 'Resources'
  | 'Images'
  | 'CSS'
  | 'JavaScript'
  | 'Fonts'
  | 'DOM'
  | 'Accessibility'
  | 'SEO'
  | 'Storage'
  | 'Security'
  | 'Network'
  | 'Best Practices';

export type IssueSeverity = 'Critical' | 'High' | 'Medium' | 'Low' | 'Info';

export type IssueImpact = 'Very High' | 'High' | 'Medium' | 'Low' | 'Unknown';

export type EstimatedTimeToFix =
  | '5 minutes'
  | '15 minutes'
  | '30 minutes'
  | '1 hour'
  | 'Several hours'
  | 'Unknown';

export type IssueStatus = 'open' | 'acknowledged' | 'resolved';

export interface PerformanceIssue {
  id: string;
  title: string;
  description: string;
  category: IssueCategory;
  subcategory: string;
  severity: IssueSeverity;
  impact: IssueImpact;
  confidence: number;
  detectedBy: string;
  metric: string;
  currentValue: string | number | null;
  recommendedValue: string | number | null;
  estimatedImprovement: string | null;
  estimatedTimeToFix: EstimatedTimeToFix;
  affectedResources: string[];
  documentationLinks: string[];
  tags: string[];
  status: IssueStatus;
}

export interface AnalysisResult {
  analyzedAt: number;
  auditUrl: string;
  rulesExecuted: number;
  issueCount: number;
  issues: PerformanceIssue[];
  byCategory: Partial<Record<IssueCategory, number>>;
  bySeverity: Partial<Record<IssueSeverity, number>>;
}

export interface AnalysisRule {
  readonly id: string;
  detect(audit: import('@shared/types').AuditResult): PerformanceIssue | null;
}
