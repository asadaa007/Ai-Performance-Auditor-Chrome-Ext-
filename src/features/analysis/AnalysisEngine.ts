import { ImpactEngine, SeverityEngine } from '@features/analysis/ImpactEngine';
import { IssueDetector } from '@features/analysis/IssueDetector';
import { IssueRegistry } from '@features/analysis/IssueRegistry';
import type {
  AnalysisResult,
  IssueCategory,
  IssueSeverity,
  PerformanceIssue,
} from '@features/analysis/types';
import type { AuditResult } from '@shared/types';

export class AnalysisEngine {
  private readonly detector: IssueDetector;
  private readonly registry: IssueRegistry;

  constructor(registry: IssueRegistry = new IssueRegistry()) {
    this.registry = registry;
    this.detector = new IssueDetector(registry);
  }

  analyze(audit: AuditResult): AnalysisResult {
    const rawIssues = this.detector.detectAll(audit);
    const issues = this.sortIssues(this.deduplicateIssues(rawIssues));

    return {
      analyzedAt: Date.now(),
      auditUrl: audit.meta.url,
      rulesExecuted: this.registry.getRuleCount(),
      issueCount: issues.length,
      issues,
      byCategory: this.countByCategory(issues),
      bySeverity: this.countBySeverity(issues),
    };
  }

  private deduplicateIssues(issues: PerformanceIssue[]): PerformanceIssue[] {
    const seen = new Map<string, PerformanceIssue>();

    for (const issue of issues) {
      if (!seen.has(issue.id)) {
        seen.set(issue.id, issue);
      }
    }

    return Array.from(seen.values());
  }

  private sortIssues(issues: PerformanceIssue[]): PerformanceIssue[] {
    return [...issues].sort((a, b) => {
      const severityDiff = SeverityEngine.compare(a.severity, b.severity);
      if (severityDiff !== 0) {
        return severityDiff;
      }

      const impactDiff = ImpactEngine.compare(a.impact, b.impact);
      if (impactDiff !== 0) {
        return impactDiff;
      }

      return a.title.localeCompare(b.title);
    });
  }

  private countByCategory(issues: PerformanceIssue[]): Partial<Record<IssueCategory, number>> {
    return issues.reduce<Partial<Record<IssueCategory, number>>>((counts, issue) => {
      counts[issue.category] = (counts[issue.category] ?? 0) + 1;
      return counts;
    }, {});
  }

  private countBySeverity(issues: PerformanceIssue[]): Partial<Record<IssueSeverity, number>> {
    return issues.reduce<Partial<Record<IssueSeverity, number>>>((counts, issue) => {
      counts[issue.severity] = (counts[issue.severity] ?? 0) + 1;
      return counts;
    }, {});
  }
}

export const analysisEngine = new AnalysisEngine();
