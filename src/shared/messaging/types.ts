export type MessageEndpoint = 'popup' | 'report' | 'background' | 'content' | 'broadcast';

export type MessageType =
  | 'PING'
  | 'REQUEST_AUDIT'
  | 'AUDIT_STARTED'
  | 'AUDIT_PROGRESS'
  | 'AUDIT_COMPLETED'
  | 'AUDIT_FAILED'
  | 'AUDIT_PAGE_CHANGED'
  | 'GET_LAST_AUDIT'
  | 'CLEAR_AUDIT'
  | 'GET_AI_CONFIG'
  | 'SAVE_AI_CONFIG'
  | 'TEST_AI_CONNECTION'
  | 'LIST_AI_MODELS'
  | 'EXPLAIN_FIX'
  | 'AI_EXPLAIN_CHUNK'
  | 'AI_EXPLAIN_DONE'
  | 'AI_EXPLAIN_ERROR'
  | 'CANCEL_AI_EXPLAIN'
  | 'GET_AI_HISTORY'
  | 'GET_AI_DEBUG_INFO'
  | 'GET_AUDIT_SNAPSHOT'
  | 'LIST_AUDIT_SNAPSHOTS'
  | 'DELETE_AUDIT_SNAPSHOT';

export interface MessageEnvelope<TPayload = unknown> {
  id: string;
  timestamp: number;
  type: MessageType;
  payload: TPayload;
  source: MessageEndpoint;
  target: MessageEndpoint;
}

export const MESSAGE_ENDPOINTS: MessageEndpoint[] = [
  'popup',
  'report',
  'background',
  'content',
  'broadcast',
];

export const MESSAGE_TYPES: MessageType[] = [
  'PING',
  'REQUEST_AUDIT',
  'AUDIT_STARTED',
  'AUDIT_PROGRESS',
  'AUDIT_COMPLETED',
  'AUDIT_FAILED',
  'AUDIT_PAGE_CHANGED',
  'GET_LAST_AUDIT',
  'CLEAR_AUDIT',
  'GET_AI_CONFIG',
  'SAVE_AI_CONFIG',
  'TEST_AI_CONNECTION',
  'LIST_AI_MODELS',
  'EXPLAIN_FIX',
  'AI_EXPLAIN_CHUNK',
  'AI_EXPLAIN_DONE',
  'AI_EXPLAIN_ERROR',
  'CANCEL_AI_EXPLAIN',
  'GET_AI_HISTORY',
  'GET_AI_DEBUG_INFO',
  'GET_AUDIT_SNAPSHOT',
  'LIST_AUDIT_SNAPSHOTS',
  'DELETE_AUDIT_SNAPSHOT',
];
