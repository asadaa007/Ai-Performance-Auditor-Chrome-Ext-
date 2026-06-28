import type { PerformanceIssue } from '@features/analysis';
import type { FixAction, FixGroup, FixPlan, FrameworkProfile } from '@features/fix-planner';
import type { ProviderType } from '@features/ai/types/provider';
import type { AnalysisResult } from '@features/analysis';
import type { AuditResult } from '@shared/types';

export interface ExplainMetric {
  label: string;
  value: string;
}

export interface ExplainPromptContext {
  siteUrl: string;
  frameworkProfile: FrameworkProfile;
  issue: PerformanceIssue;
  fixAction: FixAction;
  fixGroup: Pick<
    FixGroup,
    'id' | 'title' | 'description' | 'priority' | 'estimatedImpact' | 'complexity'
  >;
  relevantMetrics: ExplainMetric[];
  relevantResources: string[];
}

export interface ExplainLayersInput {
  audit: AuditResult;
  analysis: AnalysisResult;
  fixPlan: FixPlan;
  groupId: string;
  actionId: string;
  issueId: string;
}

export interface ExplainCacheEntry {
  promptHash: string;
  content: string;
  provider: ProviderType;
  model: string;
  latencyMs: number;
  estimatedTokens: number;
  cachedAt: number;
}

export type ExplainCacheStatus = 'hit' | 'miss' | 'bypass';

export interface ExplainHistoryEntry {
  id: string;
  promptHash: string;
  timestamp: number;
  provider: ProviderType;
  model: string;
  latencyMs: number;
  estimatedTokens: number;
  cacheStatus: ExplainCacheStatus;
  issueId: string;
  actionId: string;
  groupId: string;
  issueTitle: string;
  actionTitle: string;
  siteUrl: string;
  contentPreview: string;
}

export interface ExplainStreamState {
  requestId: string;
  status: 'idle' | 'streaming' | 'completed' | 'error' | 'cancelled';
  content: string;
  cacheStatus: ExplainCacheStatus | null;
  error: string | null;
  latencyMs: number | null;
}
