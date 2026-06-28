import type { AnalysisResult } from '@features/analysis';
import type { EnterpriseAuditReport, EnterpriseScoreResult } from '@features/enterprise-audit';
import type { FixPlan, FrameworkProfile } from '@features/fix-planner';
import type { ScoreResult } from '@features/scoring';
import type { AuditResult } from '@shared/types';

export interface AuditSnapshot {
  auditId: string;
  tabId: number;
  url: string;
  timestamp: number;
  reportVersion: string;
  auditResult: AuditResult;
  analysisResult: AnalysisResult;
  scoreResult: ScoreResult;
  enterpriseAuditResult: EnterpriseAuditReport;
  enterpriseScoreResult: EnterpriseScoreResult;
  fixPlan: FixPlan;
  frameworkProfile: FrameworkProfile;
}

export interface AuditSnapshotSummary {
  auditId: string;
  tabId: number;
  url: string;
  timestamp: number;
  reportVersion: string;
  overallScore: number | null;
  issueCount: number;
}
