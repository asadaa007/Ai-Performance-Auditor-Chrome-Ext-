import { registerAiRouter } from '@background/aiRouter';
import { registerExplainRouter } from '@background/explainRouter';
import { registerNavigationRouter } from '@background/navigationRouter';
import { registerServiceWorkerKeepAlive } from '@background/serviceWorkerKeepAlive';
import { AuditOrchestrator, wrapHandler } from '@background/auditOrchestrator';
import { TabAuditManager } from '@background/TabAuditManager';
import { AuditSnapshotManager } from '@background/AuditSnapshotManager';
import { MessageValidationError } from '@shared/errors';
import type {
  AuditCompletedPayload,
  AuditFailedPayload,
  AuditProgressPayload,
  ClearAuditPayload,
  DeleteAuditSnapshotPayload,
  GetAuditSnapshotPayload,
  GetLastAuditPayload,
  ListAuditSnapshotsPayload,
  MessageBus,
  PingPayload,
  PingResponsePayload,
  RequestAuditPayload,
} from '@shared/messaging';
import { assertValidMessage, createMessageBus } from '@shared/messaging';

const handlePing = async (): Promise<PingResponsePayload> => ({
  endpoint: 'background',
});

export function registerMessageRouter(bus: MessageBus, orchestrator: AuditOrchestrator): void {
  bus.on<PingPayload, PingResponsePayload>('PING', handlePing);

  bus.on(
    'REQUEST_AUDIT',
    wrapHandler((payload: RequestAuditPayload) => orchestrator.handleRequestAudit(payload)),
  );

  bus.on(
    'GET_LAST_AUDIT',
    wrapHandler((payload: GetLastAuditPayload) => orchestrator.handleGetLastAudit(payload.tabId)),
  );

  bus.on(
    'CLEAR_AUDIT',
    wrapHandler((payload: ClearAuditPayload) => orchestrator.handleClearAudit(payload.tabId)),
  );

  bus.on<AuditProgressPayload>('AUDIT_PROGRESS', async (message) => {
    await orchestrator.handleAuditProgress(message.payload);
    return undefined;
  });

  bus.on<AuditCompletedPayload>('AUDIT_COMPLETED', async (message) => {
    await orchestrator.handleAuditCompleted(message.payload);
    return undefined;
  });

  bus.on<AuditFailedPayload>('AUDIT_FAILED', async (message) => {
    await orchestrator.handleAuditFailed(message.payload);
    return undefined;
  });

  bus.on(
    'GET_AUDIT_SNAPSHOT',
    wrapHandler((payload: GetAuditSnapshotPayload) =>
      orchestrator.handleGetAuditSnapshot(payload.auditId),
    ),
  );

  bus.on(
    'LIST_AUDIT_SNAPSHOTS',
    wrapHandler((payload: ListAuditSnapshotsPayload) =>
      orchestrator.handleListAuditSnapshots(payload.limit),
    ),
  );

  bus.on(
    'DELETE_AUDIT_SNAPSHOT',
    wrapHandler((payload: DeleteAuditSnapshotPayload) =>
      orchestrator.handleDeleteAuditSnapshot(payload.auditId),
    ),
  );
}

export function createBackgroundServices(): {
  bus: MessageBus;
  tabAuditManager: TabAuditManager;
  snapshotManager: AuditSnapshotManager;
  orchestrator: AuditOrchestrator;
} {
  registerServiceWorkerKeepAlive();

  const bus = createMessageBus('background');
  const tabAuditManager = new TabAuditManager();
  const snapshotManager = new AuditSnapshotManager();
  const orchestrator = new AuditOrchestrator(bus, tabAuditManager, snapshotManager);
  registerMessageRouter(bus, orchestrator);
  registerNavigationRouter(bus, orchestrator);
  registerAiRouter(bus);
  registerExplainRouter(bus, tabAuditManager, snapshotManager);
  return { bus, tabAuditManager, snapshotManager, orchestrator };
}

export function validateIncomingMessage(message: unknown): void {
  try {
    assertValidMessage(message);
  } catch (error) {
    throw new MessageValidationError(
      error instanceof Error ? error.message : 'Invalid message received by background router.',
    );
  }
}
