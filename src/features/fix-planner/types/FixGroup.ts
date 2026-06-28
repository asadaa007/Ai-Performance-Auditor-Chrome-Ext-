import type { FixAction, FixComplexity, FixPerformanceImpact, FixPriority } from './FixAction';

export interface FixGroup {
  id: string;
  title: string;
  description: string;
  priority: FixPriority;
  estimatedImpact: FixPerformanceImpact;
  complexity: FixComplexity;
  framework: string;
  affectedResources: string[];
  actions: FixAction[];
}
