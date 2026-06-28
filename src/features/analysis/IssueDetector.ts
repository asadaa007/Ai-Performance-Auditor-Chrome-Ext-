import { IssueRegistry } from '@features/analysis/IssueRegistry';
import type { AnalysisRule, PerformanceIssue } from '@features/analysis/types';
import type { AuditResult } from '@shared/types';

export class IssueDetector {
  constructor(private readonly registry: IssueRegistry = new IssueRegistry()) {}

  detectAll(audit: AuditResult): PerformanceIssue[] {
    const issues: PerformanceIssue[] = [];

    for (const rule of this.registry.getRules()) {
      const issue = this.runRule(rule, audit);
      if (issue) {
        issues.push(issue);
      }
    }

    return issues;
  }

  private runRule(rule: AnalysisRule, audit: AuditResult): PerformanceIssue | null {
    try {
      return rule.detect(audit);
    } catch {
      return null;
    }
  }
}
