import { AUDIT_TIMEOUT_MS, NAVIGATION_TRACK_HASH_CHANGES } from '@shared/constants';
import {
  AuditTimeoutError,
  ContentScriptUnavailableError,
  PermissionDeniedError,
  serializeError,
  TabNotFoundError,
} from '@shared/errors';
import type {
  AuditCompletedPayload,
  AuditFailedPayload,
  AuditPageChangedPayload,
  AuditProgressPayload,
  AuditStartedPayload,
  ClearAuditResponsePayload,
  GetLastAuditResponsePayload,
  MessageBus,
  RequestAuditPayload,
} from '@shared/messaging';
import { hasPageUrlChanged } from '@shared/utils/url';
import { openReportTab } from '@shared/audit/openReportTab';
import { TabAuditManager } from '@background/TabAuditManager';
import { AuditSnapshotManager } from '@background/AuditSnapshotManager';
import { buildAuditSnapshot } from '@background/buildAuditSnapshot';
import { MAX_SNAPSHOT_COUNT } from '@shared/snapshots';

type InFlightAudit = {
  tabId: number;
  auditId: string;
  timeoutId: ReturnType<typeof setTimeout>;
};

type RecentNavigation = {
  url: string;
  at: number;
};

const RESTRICTED_URL_PATTERN = /^(chrome|chrome-extension|edge|about|devtools|view-source):/i;
const NAVIGATION_DEDUP_MS = 1_000;

export class AuditOrchestrator {
  private readonly inFlight = new Map<string, InFlightAudit>();
  private readonly recentNavigation = new Map<number, RecentNavigation>();
  private readonly tabUrls = new Map<number, string>();

  constructor(
    private readonly bus: MessageBus,
    private readonly tabAuditManager: TabAuditManager,
    private readonly snapshotManager: AuditSnapshotManager,
  ) {}

  async handleRequestAudit(payload: RequestAuditPayload): Promise<AuditStartedPayload> {
    const tab = await this.resolveTab(payload.tabId);
    const tabId = tab.id;

    if (!tabId) {
      throw new TabNotFoundError();
    }

    const url = tab.url ?? '';
    if (!url || RESTRICTED_URL_PATTERN.test(url)) {
      throw new PermissionDeniedError('Audits cannot run on restricted browser pages.', {
        url,
      });
    }

    const existing = await this.tabAuditManager.getRecord(tabId);
    if (existing?.status === 'collecting' && existing.auditId) {
      return {
        tabId,
        auditId: existing.auditId,
        url: existing.url ?? url,
      };
    }

    const auditId = payload.auditId ?? crypto.randomUUID();
    await this.tabAuditManager.markCollecting(tabId, auditId, url);
    this.registerTimeout(tabId, auditId);

    try {
      await this.bus.send({
        type: 'REQUEST_AUDIT',
        payload: { tabId, auditId },
        target: 'content',
        tabId,
        expectResponse: false,
      });
    } catch {
      this.clearTimeout(auditId);
      const error = new ContentScriptUnavailableError(
        'Unable to reach the content script. Refresh the page and try again.',
        { tabId, url },
      );
      await this.tabAuditManager.markFailed(tabId, auditId, error.serialize());
      throw error;
    }

    const started: AuditStartedPayload = { tabId, auditId, url };
    await this.bus.broadcast('AUDIT_STARTED', started);
    return started;
  }

  async handleAuditProgress(payload: AuditProgressPayload): Promise<void> {
    await this.tabAuditManager.updateProgress(
      payload.tabId,
      payload.auditId,
      payload.progress,
      payload.collector,
      payload.statusMessage,
    );
    await this.bus.broadcast('AUDIT_PROGRESS', payload);
  }

  async handleAuditCompleted(payload: AuditCompletedPayload): Promise<void> {
    this.clearTimeout(payload.auditId);
    await this.tabAuditManager.markCompleted(payload.tabId, payload.auditId, payload.result);

    const snapshot = buildAuditSnapshot({
      auditId: payload.auditId,
      tabId: payload.tabId,
      auditResult: payload.result,
    });
    await this.snapshotManager.saveSnapshot(snapshot);
    await this.snapshotManager.cleanupOldSnapshots(MAX_SNAPSHOT_COUNT);

    await this.bus.broadcast('AUDIT_COMPLETED', payload);
    await openReportTab(payload.auditId);
  }

  async handleGetAuditSnapshot(auditId: string) {
    const snapshot = await this.snapshotManager.loadSnapshot(auditId);
    return { snapshot };
  }

  async handleListAuditSnapshots(limit?: number) {
    const snapshots = await this.snapshotManager.listSnapshots(limit);
    return { snapshots };
  }

  async handleDeleteAuditSnapshot(auditId: string) {
    const deleted = await this.snapshotManager.deleteSnapshot(auditId);
    return { deleted, auditId };
  }

  async handleAuditFailed(payload: AuditFailedPayload): Promise<void> {
    this.clearTimeout(payload.auditId);
    await this.tabAuditManager.markFailed(payload.tabId, payload.auditId, payload.error);
    await this.bus.broadcast('AUDIT_FAILED', payload);
  }

  async handleGetLastAudit(tabId?: number): Promise<GetLastAuditResponsePayload> {
    const tab = await this.resolveTab(tabId);
    const resolvedTabId = tab.id;
    if (!resolvedTabId) {
      throw new TabNotFoundError();
    }

    const snapshot = await this.tabAuditManager.getSnapshot(resolvedTabId);
    return { snapshot };
  }

  async handleClearAudit(tabId?: number): Promise<ClearAuditResponsePayload> {
    const tab = await this.resolveTab(tabId);
    const resolvedTabId = tab.id;
    if (!resolvedTabId) {
      throw new TabNotFoundError();
    }

    const cleared = await this.tabAuditManager.clear(resolvedTabId);
    return { cleared, tabId: resolvedTabId };
  }

  async handlePageChanged(
    tabId: number,
    payload: Omit<AuditPageChangedPayload, 'tabId' | 'previousAuditId'>,
  ): Promise<void> {
    if (!this.shouldHandleNavigation(tabId, payload.nextUrl)) {
      return;
    }

    const record = await this.tabAuditManager.getRecord(tabId);
    const previousAuditId = record?.auditId ?? null;

    if (previousAuditId) {
      this.clearTimeout(previousAuditId);
    }

    await this.tabAuditManager.clear(tabId);
    this.tabUrls.set(tabId, payload.nextUrl);

    const event: AuditPageChangedPayload = {
      ...payload,
      tabId,
      previousAuditId,
    };
    await this.bus.broadcast('AUDIT_PAGE_CHANGED', event);

    if (RESTRICTED_URL_PATTERN.test(payload.nextUrl)) {
      return;
    }

    await this.startAuditAfterNavigation(tabId);
  }

  async handleTabUrlUpdated(tabId: number, nextUrl: string, status?: string): Promise<void> {
    const record = await this.tabAuditManager.getRecord(tabId);
    const previousUrl = record?.url ?? this.tabUrls.get(tabId) ?? nextUrl;

    if (
      !hasPageUrlChanged(previousUrl, nextUrl, NAVIGATION_TRACK_HASH_CHANGES) &&
      status !== 'complete'
    ) {
      this.tabUrls.set(tabId, nextUrl);
      return;
    }

    if (status === 'loading') {
      const previousAuditId = record?.auditId ?? null;
      if (previousAuditId) {
        this.clearTimeout(previousAuditId);
      }

      await this.tabAuditManager.clear(tabId);
      this.tabUrls.set(tabId, nextUrl);

      await this.bus.broadcast('AUDIT_PAGE_CHANGED', {
        tabId,
        previousUrl,
        nextUrl,
        changeKind: 'hard',
        observedAt: Date.now(),
        previousAuditId,
      });
      return;
    }

    if (status === 'complete') {
      await this.handlePageChanged(tabId, {
        previousUrl,
        nextUrl,
        changeKind: 'hard',
        observedAt: Date.now(),
      });
    }
  }

  private async startAuditAfterNavigation(tabId: number): Promise<void> {
    try {
      await this.handleRequestAudit({ tabId });
    } catch {
      // Restricted pages and unavailable content scripts are ignored for auto-audits.
    }
  }

  private shouldHandleNavigation(tabId: number, nextUrl: string): boolean {
    const last = this.recentNavigation.get(tabId);
    const now = Date.now();

    if (last && last.url === nextUrl && now - last.at < NAVIGATION_DEDUP_MS) {
      return false;
    }

    this.recentNavigation.set(tabId, { url: nextUrl, at: now });
    return true;
  }

  private registerTimeout(tabId: number, auditId: string): void {
    this.clearTimeout(auditId);

    const timeoutId = setTimeout(() => {
      void this.handleTimeout(tabId, auditId);
    }, AUDIT_TIMEOUT_MS);

    this.inFlight.set(auditId, { tabId, auditId, timeoutId });
  }

  private clearTimeout(auditId: string): void {
    const inFlight = this.inFlight.get(auditId);
    if (!inFlight) {
      return;
    }

    clearTimeout(inFlight.timeoutId);
    this.inFlight.delete(auditId);
  }

  private async handleTimeout(tabId: number, auditId: string): Promise<void> {
    const record = await this.tabAuditManager.getRecord(tabId);
    if (!record || record.auditId !== auditId || record.status !== 'collecting') {
      return;
    }

    const error = new AuditTimeoutError(undefined, { tabId, auditId });
    const payload: AuditFailedPayload = {
      tabId,
      auditId,
      error: error.serialize(),
    };

    await this.handleAuditFailed(payload);
  }

  private async resolveTab(tabId?: number): Promise<chrome.tabs.Tab> {
    if (tabId) {
      const tab = await chrome.tabs.get(tabId);
      if (!tab) {
        throw new TabNotFoundError();
      }
      return tab;
    }

    const [activeTab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!activeTab) {
      throw new TabNotFoundError();
    }

    return activeTab;
  }
}

export function createErrorResponse(error: unknown): { error: ReturnType<typeof serializeError> } {
  return { error: serializeError(error) };
}

export function wrapHandler<TPayload, TResponse>(
  handler: (payload: TPayload) => Promise<TResponse>,
): (
  message: { payload: TPayload },
  sender: chrome.runtime.MessageSender,
) => Promise<TResponse | { error: ReturnType<typeof serializeError> }> {
  return async (message) => {
    try {
      return await handler(message.payload);
    } catch (error) {
      return createErrorResponse(error);
    }
  };
}
