import { AuditCollector } from '@content/collectors/AuditCollector';
import { finalizeInpIfNeeded } from '@content/inp/finalizeInp';
import {
  cancelAllAudits,
  cancelAudit,
  registerAuditCancellation,
  releaseAuditCancellation,
} from '@content/auditCancellation';
import { AuditCancelledError, UnexpectedCollectorError, serializeError } from '@shared/errors';
import type {
  AuditCompletedPayload,
  AuditFailedPayload,
  AuditProgressPayload,
  AuditStartedPayload,
  MessageBus,
  RequestAuditPayload,
} from '@shared/messaging';

const auditCollector = new AuditCollector();
const activeAudits = new Set<string>();

export { cancelAllAudits, cancelAudit };

export function registerContentMessageHandlers(bus: MessageBus): void {
  bus.on<RequestAuditPayload>('REQUEST_AUDIT', async (message) => {
    const { tabId, auditId } = message.payload;

    if (!tabId || !auditId) {
      return undefined;
    }

    if (activeAudits.has(auditId)) {
      return undefined;
    }

    activeAudits.add(auditId);

    void runAudit(bus, tabId, auditId).finally(() => {
      activeAudits.delete(auditId);
      releaseAuditCancellation(auditId);
    });

    return undefined;
  });
}

async function runAudit(bus: MessageBus, tabId: number, auditId: string): Promise<void> {
  const signal = registerAuditCancellation(auditId);

  const startedPayload: AuditStartedPayload = {
    tabId,
    auditId,
    url: window.location.href,
  };

  await bus
    .send({
      type: 'AUDIT_STARTED',
      payload: startedPayload,
      target: 'background',
      expectResponse: false,
    })
    .catch(() => undefined);

  if (signal.aborted) {
    return;
  }

  try {
    const result = await auditCollector.collectAll({
      signal,
      onProgress: (event) => {
        sendProgress(bus, tabId, auditId, event, signal);
      },
    });

    if (signal.aborted) {
      return;
    }

    const finalizedResult = await finalizeInpIfNeeded(result, {
      signal,
      onStatus: (statusMessage) => {
        if (signal.aborted) {
          return;
        }

        const progressPayload: AuditProgressPayload = {
          tabId,
          auditId,
          progress: 98,
          collector: 'inp',
          completedCollectors: 16,
          totalCollectors: 16,
          statusMessage,
        };

        void bus
          .send({
            type: 'AUDIT_PROGRESS',
            payload: progressPayload,
            target: 'background',
            expectResponse: false,
          })
          .catch(() => undefined);
      },
    });

    if (signal.aborted) {
      return;
    }

    if (finalizedResult.meta.collectorErrors.length > 0) {
      const unexpected = finalizedResult.meta.collectorErrors.find((entry) => entry.message.length > 0);
      if (unexpected) {
        // Collector-level issues are preserved on the result; audit still completes.
      }
    }

    const completedPayload: AuditCompletedPayload = {
      tabId,
      auditId,
      result: finalizedResult,
    };

    await bus.send({
      type: 'AUDIT_COMPLETED',
      payload: completedPayload,
      target: 'background',
      expectResponse: false,
    });
  } catch (error) {
    if (signal.aborted || error instanceof AuditCancelledError) {
      return;
    }

    const serialized =
      error instanceof UnexpectedCollectorError
        ? error.serialize()
        : serializeError(
            new UnexpectedCollectorError(error instanceof Error ? error.message : String(error)),
          );

    const failedPayload: AuditFailedPayload = {
      tabId,
      auditId,
      error: serialized,
    };

    await bus
      .send({
        type: 'AUDIT_FAILED',
        payload: failedPayload,
        target: 'background',
        expectResponse: false,
      })
      .catch(() => undefined);
  }
}

function sendProgress(
  bus: MessageBus,
  tabId: number,
  auditId: string,
  event: {
    collector: string;
    completedCollectors: number;
    totalCollectors: number;
    progress: number;
  },
  signal: AbortSignal,
): void {
  if (signal.aborted) {
    return;
  }

  const progressPayload: AuditProgressPayload = {
    tabId,
    auditId,
    progress: event.progress,
    collector: event.collector,
    completedCollectors: event.completedCollectors,
    totalCollectors: event.totalCollectors,
  };

  void bus
    .send({
      type: 'AUDIT_PROGRESS',
      payload: progressPayload,
      target: 'background',
      expectResponse: false,
    })
    .catch(() => undefined);
}
