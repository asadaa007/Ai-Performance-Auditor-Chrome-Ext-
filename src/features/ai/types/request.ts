export type SystemPromptTemplate =
  | 'general-analysis'
  | 'fix-single-issue'
  | 'explain-metric'
  | 'accessibility-review'
  | 'seo-review'
  | 'performance-review'
  | 'react-optimization'
  | 'nextjs-optimization'
  | 'wordpress-optimization'
  | 'static-html-optimization';

export interface PromptContext {
  siteUrl: string;
  collectedAt: string;
  collectionDurationMs: number;
  keyMetrics: Array<{ label: string; value: string }>;
  topIssues: Array<{
    id: string;
    title: string;
    severity: string;
    impact: string;
    category: string;
    affectedResources: string[];
  }>;
  selectedIssue?: {
    id: string;
    title: string;
    severity: string;
    impact: string;
    description: string;
    metric: string;
    currentValue: string | number | null;
    affectedResources: string[];
  };
  metaSummary?: {
    title: string | null;
    description: string | null;
    canonical: string | null;
    robots: string | null;
  };
}

export interface AIRequest {
  id: string;
  provider: import('./provider').ProviderType;
  model: string;
  systemPrompt: string;
  userPrompt: string;
  temperature: number;
  maxTokens: number;
  template: SystemPromptTemplate;
  estimatedInputTokens?: number;
}

export interface ExplainPromptInput {
  context: import('@features/ai-explain/types').ExplainPromptContext;
}

export interface PromptBuilderInput {
  audit: import('@shared/types').AuditResult;
  analysis: import('@features/analysis').AnalysisResult;
  template?: SystemPromptTemplate;
  selectedIssueId?: string;
  maxIssues?: number;
}
