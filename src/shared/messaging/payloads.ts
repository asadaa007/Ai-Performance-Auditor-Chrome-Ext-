import type { AuditResult } from '@shared/types';
import type { SerializedAuditError } from '@shared/errors';

export interface PingPayload {
  nonce?: string;
}

export interface PingResponsePayload {
  nonce?: string;
  endpoint: string;
}

export interface RequestAuditPayload {
  tabId?: number;
  auditId?: string;
}

export interface AuditStartedPayload {
  tabId: number;
  auditId: string;
  url: string;
}

export interface AuditProgressPayload {
  tabId: number;
  auditId: string;
  progress: number;
  collector: string;
  completedCollectors: number;
  totalCollectors: number;
  statusMessage?: string;
}

export interface AuditCompletedPayload {
  tabId: number;
  auditId: string;
  result: AuditResult;
}

export interface AuditFailedPayload {
  tabId: number;
  auditId: string;
  error: SerializedAuditError;
}

export type PageChangeKind = 'history' | 'popstate' | 'hash' | 'framework' | 'hard';

export interface AuditPageChangedPayload {
  tabId?: number;
  previousUrl: string;
  nextUrl: string;
  changeKind: PageChangeKind;
  observedAt: number;
  previousAuditId?: string | null;
}

export interface GetLastAuditPayload {
  tabId?: number;
}

export interface ClearAuditPayload {
  tabId?: number;
}

export type AuditStatus = 'idle' | 'collecting' | 'completed' | 'failed';

export interface TabAuditSnapshot {
  tabId: number;
  auditId: string | null;
  status: AuditStatus;
  progress: number;
  currentCollector: string | null;
  result: AuditResult | null;
  error: SerializedAuditError | null;
  startedAt: number | null;
  completedAt: number | null;
  collectionDurationMs: number | null;
  url: string | null;
}

export interface GetLastAuditResponsePayload {
  snapshot: TabAuditSnapshot | null;
}

export interface ClearAuditResponsePayload {
  cleared: boolean;
  tabId: number;
}

export interface GetAiConfigResponsePayload {
  config: import('@features/ai').PublicAIConfig;
}

export interface SaveAiConfigPayload {
  provider?: import('@features/ai').ProviderType;
  model?: string;
  temperature?: number;
  maxTokens?: number;
  ollamaBaseUrl?: string;
  apiKey?: string;
}

export interface SaveAiConfigResponsePayload {
  config: import('@features/ai').PublicAIConfig;
}

export interface TestAiConnectionPayload {
  provider?: import('@features/ai').ProviderType;
  model?: string;
  temperature?: number;
  maxTokens?: number;
  ollamaBaseUrl?: string;
  apiKey?: string;
}

export interface TestAiConnectionResponsePayload {
  result: import('@features/ai').HealthCheckResult;
}

export interface ListAiModelsPayload {
  provider?: import('@features/ai').ProviderType;
  apiKey?: string;
  ollamaBaseUrl?: string;
}

export interface ListAiModelsResponsePayload {
  models: import('@features/ai').AIModel[];
}

export interface ExplainFixPayload {
  tabId?: number;
  auditId?: string;
  groupId: string;
  actionId: string;
  issueId: string;
}

export interface ExplainFixResponsePayload {
  requestId: string;
}

export interface AiExplainChunkPayload {
  requestId: string;
  delta: string;
  done: boolean;
  finishReason?: import('@features/ai').FinishReason;
}

export interface AiExplainDonePayload {
  requestId: string;
  cacheStatus: import('@features/ai-explain').ExplainCacheStatus;
  latencyMs: number;
  estimatedTokens: number;
  provider: import('@features/ai').ProviderType;
  model: string;
}

export interface AiExplainErrorPayload {
  requestId: string;
  message: string;
  code?: string;
  retryable?: boolean;
}

export interface CancelAiExplainResponsePayload {
  cancelled: boolean;
}

export interface GetAiHistoryResponsePayload {
  history: import('@features/ai-explain').ExplainHistoryEntry[];
}

export interface GetAiDebugInfoResponsePayload {
  diagnostics: import('@features/ai/storage/ApiKeyManager').AiConfigDiagnostics;
  connectionStatus: 'unknown' | 'connected' | 'error';
}

export interface GetAuditSnapshotPayload {
  auditId: string;
}

export interface GetAuditSnapshotResponsePayload {
  snapshot: import('@shared/snapshots').AuditSnapshot | null;
}

export interface ListAuditSnapshotsPayload {
  limit?: number;
}

export interface ListAuditSnapshotsResponsePayload {
  snapshots: import('@shared/snapshots').AuditSnapshotSummary[];
}

export interface DeleteAuditSnapshotPayload {
  auditId: string;
}

export interface DeleteAuditSnapshotResponsePayload {
  deleted: boolean;
  auditId: string;
}

export type MessagePayloadMap = {
  PING: PingPayload;
  REQUEST_AUDIT: RequestAuditPayload;
  AUDIT_STARTED: AuditStartedPayload;
  AUDIT_PROGRESS: AuditProgressPayload;
  AUDIT_COMPLETED: AuditCompletedPayload;
  AUDIT_FAILED: AuditFailedPayload;
  AUDIT_PAGE_CHANGED: AuditPageChangedPayload;
  GET_LAST_AUDIT: GetLastAuditPayload;
  CLEAR_AUDIT: ClearAuditPayload;
  GET_AI_CONFIG: Record<string, never>;
  SAVE_AI_CONFIG: SaveAiConfigPayload;
  TEST_AI_CONNECTION: TestAiConnectionPayload;
  LIST_AI_MODELS: ListAiModelsPayload;
  EXPLAIN_FIX: ExplainFixPayload;
  AI_EXPLAIN_CHUNK: AiExplainChunkPayload;
  AI_EXPLAIN_DONE: AiExplainDonePayload;
  AI_EXPLAIN_ERROR: AiExplainErrorPayload;
  CANCEL_AI_EXPLAIN: Record<string, never>;
  GET_AI_HISTORY: Record<string, never>;
  GET_AI_DEBUG_INFO: Record<string, never>;
  GET_AUDIT_SNAPSHOT: GetAuditSnapshotPayload;
  LIST_AUDIT_SNAPSHOTS: ListAuditSnapshotsPayload;
  DELETE_AUDIT_SNAPSHOT: DeleteAuditSnapshotPayload;
};

export type MessageResponseMap = {
  PING: PingResponsePayload;
  REQUEST_AUDIT: AuditStartedPayload;
  AUDIT_STARTED: void;
  AUDIT_PROGRESS: void;
  AUDIT_COMPLETED: void;
  AUDIT_FAILED: void;
  AUDIT_PAGE_CHANGED: void;
  GET_LAST_AUDIT: GetLastAuditResponsePayload;
  CLEAR_AUDIT: ClearAuditResponsePayload;
  GET_AI_CONFIG: GetAiConfigResponsePayload;
  SAVE_AI_CONFIG: SaveAiConfigResponsePayload;
  TEST_AI_CONNECTION: TestAiConnectionResponsePayload;
  LIST_AI_MODELS: ListAiModelsResponsePayload;
  EXPLAIN_FIX: ExplainFixResponsePayload;
  AI_EXPLAIN_CHUNK: void;
  AI_EXPLAIN_DONE: void;
  AI_EXPLAIN_ERROR: void;
  CANCEL_AI_EXPLAIN: CancelAiExplainResponsePayload;
  GET_AI_HISTORY: GetAiHistoryResponsePayload;
  GET_AI_DEBUG_INFO: GetAiDebugInfoResponsePayload;
  GET_AUDIT_SNAPSHOT: GetAuditSnapshotResponsePayload;
  LIST_AUDIT_SNAPSHOTS: ListAuditSnapshotsResponsePayload;
  DELETE_AUDIT_SNAPSHOT: DeleteAuditSnapshotResponsePayload;
};
