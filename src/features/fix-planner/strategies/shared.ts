import type { PerformanceIssue } from '@features/analysis';
import type { FrameworkProfile } from '@features/fix-planner/types';
import type { FixAction, ImplementationType } from '@features/fix-planner/types/FixAction';
import type { AuditResult } from '@shared/types';
import {
  complexityFromIssue,
  impactFromIssue,
  priorityFromIssue,
} from '@features/fix-planner/ComplexityEstimator';

export interface FixStrategyContext {
  issue: PerformanceIssue;
  audit: AuditResult;
  profile: FrameworkProfile;
}

export interface FixActionDraft extends FixAction {
  groupId: string;
}

export type FixStrategy = (context: FixStrategyContext) => FixActionDraft[];

export function resolveImplementationType(
  profile: FrameworkProfile,
  fallback: ImplementationType,
  overrides?: Partial<Record<string, ImplementationType>>,
): ImplementationType {
  const key = profile.primaryFramework.toLowerCase();
  if (overrides?.[key]) {
    return overrides[key];
  }
  if (profile.cms === 'WordPress') {
    return 'WordPress Theme';
  }
  if (profile.primaryFramework === 'Next.js') {
    return 'Next.js';
  }
  if (profile.uiLibrary === 'React') {
    return 'React Component';
  }
  return fallback;
}

export type ActionDraftInput = {
  id: string;
  title: string;
  groupId: string;
  implementationType: ImplementationType;
  priority?: FixAction['priority'];
  complexity?: FixAction['complexity'];
  estimatedTime?: string;
  estimatedImpact?: FixAction['estimatedImpact'];
  frameworkSpecific?: boolean;
  requiresDeveloper?: boolean;
  manualVerification?: boolean;
  dependsOn?: string[];
};

export function action(ctx: FixStrategyContext, draft: ActionDraftInput): FixActionDraft {
  const { issue } = ctx;
  return {
    category: issue.category,
    relatedIssues: [issue.id],
    affectedResources: issue.affectedResources.slice(0, 5),
    priority: draft.priority ?? priorityFromIssue(issue),
    complexity: draft.complexity ?? complexityFromIssue(issue, draft.requiresDeveloper ?? true),
    estimatedTime: draft.estimatedTime ?? issue.estimatedTimeToFix,
    estimatedImpact: draft.estimatedImpact ?? impactFromIssue(issue),
    frameworkSpecific: draft.frameworkSpecific ?? false,
    requiresDeveloper: draft.requiresDeveloper ?? true,
    manualVerification: draft.manualVerification ?? false,
    dependsOn: draft.dependsOn ?? [],
    groupId: draft.groupId,
    id: draft.id,
    title: draft.title,
    implementationType: draft.implementationType,
  };
}
