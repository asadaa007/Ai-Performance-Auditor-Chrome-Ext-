import { explainService } from '@features/ai-explain/ExplainService';
import { explainHistory } from '@features/ai-explain/storage/ExplainStorage';
import type { TabAuditManager } from '@background/TabAuditManager';
import type { AuditSnapshotManager } from '@background/AuditSnapshotManager';
import { wrapHandler } from '@background/auditOrchestrator';
import type {
  AiExplainChunkPayload,
  AiExplainDonePayload,
  AiExplainErrorPayload,
  ExplainFixPayload,
} from '@shared/messaging';
import { runWithServiceWorkerKeepAlive } from '@background/serviceWorkerKeepAlive';
import type { MessageBus } from '@shared/messaging';

async function resolveAuditResult(
  payload: ExplainFixPayload,
  tabAuditManager: TabAuditManager,
  snapshotManager: AuditSnapshotManager,
) {
  if (payload.auditId) {
    const snapshot = await snapshotManager.loadSnapshot(payload.auditId);
    if (snapshot?.auditResult) {
      return snapshot.auditResult;
    }
    throw new Error('No audit snapshot is available for this report.');
  }

  const tabId = await resolveTabId(payload.tabId);
  const record = await tabAuditManager.getRecord(tabId);
  if (!record?.result) {
    throw new Error('No completed audit is available for the active tab.');
  }
  return record.result;
}

async function resolveTabId(tabId?: number): Promise<number> {
  if (tabId) {
    return tabId;
  }

  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab?.id) {
    throw new Error('No active tab found for explain request.');
  }
  return tab.id;
}

export function registerExplainRouter(
  bus: MessageBus,
  tabAuditManager: TabAuditManager,
  snapshotManager: AuditSnapshotManager,
): void {
  bus.on(
    'EXPLAIN_FIX',
    wrapHandler(async (payload: ExplainFixPayload) => {
      const auditResult = await resolveAuditResult(payload, tabAuditManager, snapshotManager);

      const layers = explainService.buildLayers(
        auditResult,
        payload.groupId,
        payload.actionId,
        payload.issueId,
      );

      const request = await explainService.buildRequestPreview(layers);
      const requestId = request.id;

      void runWithServiceWorkerKeepAlive(async () => {
        try {
          const result = await explainService.runExplain(
            layers,
            (chunk) => {
              const event: AiExplainChunkPayload = {
                requestId: chunk.id,
                delta: chunk.delta,
                done: chunk.done,
                finishReason: chunk.finishReason,
              };
              void bus.broadcast('AI_EXPLAIN_CHUNK', event);
            },
            request,
          );

          if (result.response?.error) {
            const errorEvent: AiExplainErrorPayload = {
              requestId: result.requestId,
              message: result.response.error.message,
              code: result.response.error.code,
              retryable: result.response.error.retryable,
            };
            void bus.broadcast('AI_EXPLAIN_ERROR', errorEvent);
            return;
          }

          const doneEvent: AiExplainDonePayload = {
            requestId: result.requestId,
            cacheStatus: result.cacheStatus,
            latencyMs: result.latencyMs,
            estimatedTokens: result.estimatedTokens,
            provider: result.provider,
            model: result.model,
          };
          void bus.broadcast('AI_EXPLAIN_DONE', doneEvent);
        } catch (error) {
          const errorEvent: AiExplainErrorPayload = {
            requestId,
            message: error instanceof Error ? error.message : String(error),
          };
          void bus.broadcast('AI_EXPLAIN_ERROR', errorEvent);
        }
      });

      return { requestId };
    }),
  );

  bus.on(
    'CANCEL_AI_EXPLAIN',
    wrapHandler(async () => {
      await explainService.cancel();
      return { cancelled: true };
    }),
  );

  bus.on(
    'GET_AI_HISTORY',
    wrapHandler(async () => ({
      history: await explainHistory.list(),
    })),
  );
}
