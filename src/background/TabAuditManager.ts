import { AUDIT_EXPIRY_MS, SESSION_STORAGE_KEY } from '@shared/constants';
import type { SerializedAuditError } from '@shared/errors';
import type { AuditStatus, TabAuditSnapshot } from '@shared/messaging';
import type { AuditResult } from '@shared/types';

export interface TabAuditRecord {
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
  updatedAt: number;
}

type TabAuditStore = Record<string, TabAuditRecord>;

export class TabAuditManager {
  constructor(private readonly expiryMs: number = AUDIT_EXPIRY_MS) {}

  async getSnapshot(tabId: number): Promise<TabAuditSnapshot | null> {
    const record = await this.getRecord(tabId);
    return record ? this.toSnapshot(record) : null;
  }

  async getRecord(tabId: number): Promise<TabAuditRecord | null> {
    await this.expireStale();
    const store = await this.readStore();
    return store[String(tabId)] ?? null;
  }

  async saveRecord(record: TabAuditRecord): Promise<void> {
    const store = await this.readStore();
    store[String(record.tabId)] = {
      ...record,
      updatedAt: Date.now(),
    };
    await this.writeStore(store);
  }

  async markCollecting(tabId: number, auditId: string, url: string): Promise<TabAuditRecord> {
    const record: TabAuditRecord = {
      tabId,
      auditId,
      status: 'collecting',
      progress: 0,
      currentCollector: null,
      result: null,
      error: null,
      startedAt: Date.now(),
      completedAt: null,
      collectionDurationMs: null,
      url,
      updatedAt: Date.now(),
    };

    await this.saveRecord(record);
    return record;
  }

  async updateProgress(
    tabId: number,
    auditId: string,
    progress: number,
    collector: string,
    statusMessage?: string,
  ): Promise<TabAuditRecord | null> {
    const record = await this.getRecord(tabId);
    if (!record || record.auditId !== auditId) {
      return null;
    }

    const updated: TabAuditRecord = {
      ...record,
      status: 'collecting',
      progress,
      currentCollector: statusMessage ?? collector,
      updatedAt: Date.now(),
    };

    await this.saveRecord(updated);
    return updated;
  }

  async markCompleted(
    tabId: number,
    auditId: string,
    result: AuditResult,
  ): Promise<TabAuditRecord | null> {
    const record = await this.getRecord(tabId);
    if (!record || record.auditId !== auditId) {
      return null;
    }

    const updated: TabAuditRecord = {
      ...record,
      status: 'completed',
      progress: 100,
      currentCollector: null,
      result,
      error: null,
      completedAt: Date.now(),
      collectionDurationMs: result.meta.collectionDurationMs,
      url: result.meta.url,
      updatedAt: Date.now(),
    };

    await this.saveRecord(updated);
    return updated;
  }

  async markFailed(
    tabId: number,
    auditId: string,
    error: SerializedAuditError,
  ): Promise<TabAuditRecord | null> {
    const record = await this.getRecord(tabId);
    if (!record || record.auditId !== auditId) {
      return null;
    }

    const updated: TabAuditRecord = {
      ...record,
      status: 'failed',
      currentCollector: null,
      error,
      completedAt: Date.now(),
      updatedAt: Date.now(),
    };

    await this.saveRecord(updated);
    return updated;
  }

  async clear(tabId: number): Promise<boolean> {
    const store = await this.readStore();
    const key = String(tabId);
    if (!store[key]) {
      return false;
    }

    delete store[key];
    await this.writeStore(store);
    return true;
  }

  async expireStale(): Promise<void> {
    const store = await this.readStore();
    const now = Date.now();
    let changed = false;

    for (const [key, record] of Object.entries(store)) {
      if (now - record.updatedAt > this.expiryMs) {
        delete store[key];
        changed = true;
      }
    }

    if (changed) {
      await this.writeStore(store);
    }
  }

  private toSnapshot(record: TabAuditRecord): TabAuditSnapshot {
    return {
      tabId: record.tabId,
      auditId: record.auditId,
      status: record.status,
      progress: record.progress,
      currentCollector: record.currentCollector,
      result: record.result,
      error: record.error,
      startedAt: record.startedAt,
      completedAt: record.completedAt,
      collectionDurationMs: record.collectionDurationMs,
      url: record.url,
    };
  }

  private async readStore(): Promise<TabAuditStore> {
    const result = await chrome.storage.session.get(SESSION_STORAGE_KEY);
    const store = result[SESSION_STORAGE_KEY];
    return store && typeof store === 'object' ? (store as TabAuditStore) : {};
  }

  private async writeStore(store: TabAuditStore): Promise<void> {
    await chrome.storage.session.set({ [SESSION_STORAGE_KEY]: store });
  }
}
