import type { IssueImpact, IssueSeverity } from '@features/analysis/types';

const SEVERITY_WEIGHT: Record<IssueSeverity, number> = {
  Critical: 5,
  High: 4,
  Medium: 3,
  Low: 2,
  Info: 1,
};

const IMPACT_WEIGHT: Record<IssueImpact, number> = {
  'Very High': 5,
  High: 4,
  Medium: 3,
  Low: 2,
  Unknown: 0,
};

export class SeverityEngine {
  static weight(severity: IssueSeverity): number {
    return SEVERITY_WEIGHT[severity];
  }

  static compare(a: IssueSeverity, b: IssueSeverity): number {
    return SeverityEngine.weight(b) - SeverityEngine.weight(a);
  }
}

export class ImpactEngine {
  static weight(impact: IssueImpact): number {
    return IMPACT_WEIGHT[impact];
  }

  static compare(a: IssueImpact, b: IssueImpact): number {
    return ImpactEngine.weight(b) - ImpactEngine.weight(a);
  }
}
