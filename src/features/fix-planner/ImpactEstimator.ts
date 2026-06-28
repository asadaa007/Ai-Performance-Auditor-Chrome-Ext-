import type { IssueImpact, PerformanceIssue } from '@features/analysis';
import type { FixPerformanceImpact } from '@features/fix-planner/types';

export function estimateActionImpact(
  issue: PerformanceIssue,
  override?: FixPerformanceImpact,
): FixPerformanceImpact {
  if (override) {
    return override;
  }
  return issue.impact as IssueImpact;
}

export function estimateGroupImpact(impacts: FixPerformanceImpact[]): FixPerformanceImpact {
  const order: FixPerformanceImpact[] = ['Very High', 'High', 'Medium', 'Low', 'Unknown'];
  for (const level of order) {
    if (impacts.includes(level)) {
      return level;
    }
  }
  return 'Unknown';
}
