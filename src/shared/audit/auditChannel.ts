import { useAuditStore } from '@shared/audit/auditStore';
import {
  auditErrorFromSerialized,
  isErrorResponse,
  type SerializedAuditError,
} from '@shared/errors';
import type {
  AuditCompletedPayload,
  AuditFailedPayload,
  AuditPageChangedPayload,
  AuditProgressPayload,
  AuditStartedPayload,
  ClearAuditPayload,
  ClearAuditResponsePayload,
  GetLastAuditPayload,
  GetLastAuditResponsePayload,
  MessageBus,
  RequestAuditPayload,
} from '@shared/messaging';

const registeredBuses = new WeakSet<MessageBus>();

async function getActiveTabId(): Promise<number> {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab?.id) {
    throw new Error('No active tab found.');
  }
  return tab.id;
}

function unwrapRpcResponse<T>(response: T | { error: SerializedAuditError }): T {
  if (isErrorResponse(response)) {
    throw auditErrorFromSerialized(response.error);
  }
  return response;
}

function registerListeners(bus: MessageBus): void {
  bus.on<AuditStartedPayload>('AUDIT_STARTED', async (message) => {
    useAuditStore.getState().setStarted(message.payload);
  });

  bus.on<AuditProgressPayload>('AUDIT_PROGRESS', async (message) => {
    useAuditStore.getState().setProgress(message.payload);
  });

  bus.on<AuditCompletedPayload>('AUDIT_COMPLETED', async (message) => {
    useAuditStore.getState().setCompleted(message.payload);
  });

  bus.on<AuditFailedPayload>('AUDIT_FAILED', async (message) => {
    useAuditStore.getState().setFailed(message.payload);
  });

  bus.on<AuditPageChangedPayload>('AUDIT_PAGE_CHANGED', async (message) => {
    useAuditStore.getState().setPageChanged(message.payload);
  });
}

export async function initializeAuditChannel(
  bus: MessageBus,
  options?: { tabId?: number; forceHydrate?: boolean },
): Promise<void> {
  if (!registeredBuses.has(bus)) {
    registerListeners(bus);
    registeredBuses.add(bus);
  }

  const store = useAuditStore.getState();
  if (store.isHydrated && !options?.forceHydrate) {
    return;
  }

  const tabId = options?.tabId ?? (await getActiveTabId());

  if (options?.tabId !== undefined) {
    useAuditStore.setState({ tabId: options.tabId });
  }

  const response = await bus.send<
    GetLastAuditPayload,
    GetLastAuditResponsePayload | { error: SerializedAuditError }
  >({
    type: 'GET_LAST_AUDIT',
    payload: { tabId },
    target: 'background',
  });

  const data = unwrapRpcResponse(response);
  store.setSnapshot(data.snapshot);
}

export async function requestAudit(bus: MessageBus): Promise<void> {
  const tabId = await getActiveTabId();
  const response = await bus.send<
    RequestAuditPayload,
    AuditStartedPayload | { error: SerializedAuditError }
  >({
    type: 'REQUEST_AUDIT',
    payload: { tabId },
    target: 'background',
  });

  const started = unwrapRpcResponse(response);
  useAuditStore.getState().setStarted(started);
}

export async function clearAudit(bus: MessageBus): Promise<void> {
  const tabId = await getActiveTabId();
  const response = await bus.send<
    ClearAuditPayload,
    ClearAuditResponsePayload | { error: SerializedAuditError }
  >({
    type: 'CLEAR_AUDIT',
    payload: { tabId },
    target: 'background',
  });

  unwrapRpcResponse(response);
  useAuditStore.getState().reset();
}
