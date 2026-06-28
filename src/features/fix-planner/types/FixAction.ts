import type { IssueCategory } from '@features/analysis';

export type FixComplexity = 'Very Easy' | 'Easy' | 'Medium' | 'Hard' | 'Expert';

export type FixPerformanceImpact = 'Very High' | 'High' | 'Medium' | 'Low' | 'Unknown';

export type FixPriority = 'Critical' | 'High' | 'Medium' | 'Low';

export type ImplementationType =
  | 'HTML'
  | 'CSS'
  | 'JavaScript'
  | 'React Component'
  | 'Next.js'
  | 'WordPress Theme'
  | 'WordPress Plugin'
  | 'Server Configuration'
  | 'Image Optimization'
  | 'Build Configuration'
  | 'Asset Pipeline'
  | 'CDN';

export interface FixAction {
  id: string;
  title: string;
  category: IssueCategory;
  priority: FixPriority;
  complexity: FixComplexity;
  estimatedTime: string;
  estimatedImpact: FixPerformanceImpact;
  frameworkSpecific: boolean;
  requiresDeveloper: boolean;
  manualVerification: boolean;
  relatedIssues: string[];
  affectedResources: string[];
  implementationType: ImplementationType;
  dependsOn: string[];
}
