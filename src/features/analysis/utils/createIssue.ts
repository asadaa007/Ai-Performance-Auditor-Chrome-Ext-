import type { PerformanceIssue } from '@features/analysis/types';

export function createIssue(
  issue: Omit<PerformanceIssue, 'status'> & { status?: PerformanceIssue['status'] },
): PerformanceIssue {
  return {
    status: 'open',
    ...issue,
  };
}
