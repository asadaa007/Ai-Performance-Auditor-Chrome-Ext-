import { analysisEngine } from '@features/analysis';
import { enterpriseAuditEngine, enterpriseScoringEngine } from '@features/enterprise-audit';
import { fixPlanner, frameworkDetector } from '@features/fix-planner';
import { scoringEngine } from '@features/scoring';
import type { AuditSnapshot } from '@shared/snapshots';
import { REPORT_VERSION } from '@shared/snapshots';
import type { AuditResult } from '@shared/types';

export function buildAuditSnapshot(input: {
  auditId: string;
  tabId: number;
  auditResult: AuditResult;
}): AuditSnapshot {
  const { auditId, tabId, auditResult } = input;
  const analysisResult = analysisEngine.analyze(auditResult);
  const scoreResult = scoringEngine.score(analysisResult);
  const enterpriseAuditResult = enterpriseAuditEngine.runAll(auditResult);
  const enterpriseScoreResult = enterpriseScoringEngine.score(enterpriseAuditResult);
  const frameworkProfile = frameworkDetector.detect(auditResult);
  const fixPlan = fixPlanner.plan(auditResult, analysisResult);

  return {
    auditId,
    tabId,
    url: auditResult.meta.url,
    timestamp: auditResult.meta.collectedAt,
    reportVersion: REPORT_VERSION,
    auditResult,
    analysisResult,
    scoreResult,
    enterpriseAuditResult,
    enterpriseScoreResult,
    fixPlan,
    frameworkProfile,
  };
}
