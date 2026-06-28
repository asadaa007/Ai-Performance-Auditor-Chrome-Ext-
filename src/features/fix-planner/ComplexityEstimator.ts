import type { IssueSeverity, PerformanceIssue } from '@features/analysis';
import type { FixComplexity, FixPerformanceImpact, FixPriority } from '@features/fix-planner/types';

const SEVERITY_PRIORITY: Record<IssueSeverity, FixPriority> = {
  Critical: 'Critical',
  High: 'High',
  Medium: 'Medium',
  Low: 'Low',
  Info: 'Low',
};

const TIME_COMPLEXITY: Record<string, FixComplexity> = {
  '5 minutes': 'Very Easy',
  '15 minutes': 'Easy',
  '30 minutes': 'Medium',
  '1 hour': 'Medium',
  'Several hours': 'Hard',
  Unknown: 'Medium',
};

export function priorityFromIssue(issue: PerformanceIssue): FixPriority {
  return SEVERITY_PRIORITY[issue.severity];
}

export function complexityFromIssue(
  issue: PerformanceIssue,
  requiresDeveloper = true,
): FixComplexity {
  const base = TIME_COMPLEXITY[issue.estimatedTimeToFix] ?? 'Medium';
  if (!requiresDeveloper && base === 'Hard') {
    return 'Medium';
  }
  return base;
}

export function impactFromIssue(issue: PerformanceIssue): FixPerformanceImpact {
  return issue.impact;
}

export function maxPriority(priorities: FixPriority[]): FixPriority {
  const order: FixPriority[] = ['Critical', 'High', 'Medium', 'Low'];
  for (const level of order) {
    if (priorities.includes(level)) {
      return level;
    }
  }
  return 'Low';
}

export function maxImpact(impacts: FixPerformanceImpact[]): FixPerformanceImpact {
  const order: FixPerformanceImpact[] = ['Very High', 'High', 'Medium', 'Low', 'Unknown'];
  for (const level of order) {
    if (impacts.includes(level)) {
      return level;
    }
  }
  return 'Unknown';
}

export function maxComplexity(complexities: FixComplexity[]): FixComplexity {
  const order: FixComplexity[] = ['Expert', 'Hard', 'Medium', 'Easy', 'Very Easy'];
  for (const level of order) {
    if (complexities.includes(level)) {
      return level;
    }
  }
  return 'Easy';
}
