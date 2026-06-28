import type { FixAction } from './FixAction';
import type { FixGroup } from './FixGroup';
import type { FrameworkProfile } from './FrameworkProfile';

export interface FixPlan {
  generatedAt: number;
  auditUrl: string;
  frameworkProfile: FrameworkProfile;
  actionCount: number;
  groupCount: number;
  groups: FixGroup[];
  actions: FixAction[];
  unresolvedDependencies: string[];
}
