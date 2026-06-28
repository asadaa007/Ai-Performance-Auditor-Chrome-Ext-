export type AuditCategory =
  | 'performance'
  | 'accessibility'
  | 'seo'
  | 'best-practices'
  | 'security'
  | 'network';

export type AuditGroup = 'A' | 'B' | 'C';

export type AuditSupportLevel = 'full' | 'partial' | 'unsupported';

export type AuditExecutionStatus = 'pass' | 'fail' | 'skipped' | 'unsupported';

export type AuditConfidence = 'high' | 'medium' | 'low';

export type AuditSeverity = 'Critical' | 'High' | 'Medium' | 'Low' | 'Info';

export interface AuditDefinition {
  id: string;
  lighthouseId: string;
  category: AuditCategory;
  subcategory: string;
  title: string;
  description: string;
  severity: AuditSeverity;
  weight: number;
  group: AuditGroup;
  supportLevel: AuditSupportLevel;
  documentationRef: string;
  relatedResources: string[];
  fixStrategy: string | null;
  unsupportedReason?: string;
  missingCapability?: string;
  futureImplementation?: string;
  limitations?: string[];
}

export interface AuditExecutionResult {
  id: string;
  lighthouseId: string;
  category: AuditCategory;
  subcategory: string;
  title: string;
  description: string;
  severity: AuditSeverity;
  weight: number;
  group: AuditGroup;
  supportLevel: AuditSupportLevel;
  status: AuditExecutionStatus;
  pass: boolean;
  confidence: AuditConfidence;
  currentValue: string | number | boolean | null;
  expectedValue: string | number | boolean | null;
  threshold: string | null;
  unsupportedReason: string | null;
  missingCapability: string | null;
  futureImplementation: string | null;
  limitations: string[];
  documentationRef: string;
  relatedResources: string[];
  fixStrategy: string | null;
  evidence: Record<string, unknown>;
  executionTimeMs: number;
}

export interface CategoryAuditSummary {
  category: AuditCategory;
  total: number;
  passed: number;
  failed: number;
  skipped: number;
  unsupported: number;
  partial: number;
  implemented: number;
  coveragePercent: number;
  confidenceScore: number;
  weightedScore: number;
  maxAchievableScore: number;
  pointsLost: number;
  scoreExplanation: string;
}

export interface EnterpriseAuditReport {
  auditedAt: number;
  auditUrl: string;
  collectionDurationMs: number;
  results: AuditExecutionResult[];
  summary: {
    total: number;
    passed: number;
    failed: number;
    skipped: number;
    unsupported: number;
    partial: number;
    coveragePercent: number;
    confidenceScore: number;
    byCategory: Record<AuditCategory, CategoryAuditSummary>;
  };
  lighthouseComparison: {
    totalLighthouseAudits: number;
    groupA: number;
    groupB: number;
    groupC: number;
    implementedFull: number;
    implementedPartial: number;
    unsupported: number;
    coveragePercent: number;
  };
}

export interface AuditContext {
  audit: import('@shared/types').AuditResult;
}

export interface RunnableAudit extends AuditDefinition {
  supportLevel: 'full' | 'partial';
  run: (
    context: AuditContext,
  ) => Omit<
    AuditExecutionResult,
    | 'id'
    | 'lighthouseId'
    | 'category'
    | 'subcategory'
    | 'title'
    | 'description'
    | 'severity'
    | 'weight'
    | 'group'
    | 'supportLevel'
    | 'documentationRef'
    | 'relatedResources'
    | 'fixStrategy'
    | 'limitations'
    | 'executionTimeMs'
  >;
}
