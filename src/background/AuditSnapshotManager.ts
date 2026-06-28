import type { AuditSnapshot, AuditSnapshotSummary } from '@shared/snapshots';
import {
  MAX_SNAPSHOT_COUNT,
  SNAPSHOT_INDEX_KEY,
  SNAPSHOT_STORAGE_KEY,
} from '@shared/snapshots';

function snapshotKey(auditId: string): string {
  return `${SNAPSHOT_STORAGE_KEY}:${auditId}`;
}

function toSummary(snapshot: AuditSnapshot): AuditSnapshotSummary {
  return {
    auditId: snapshot.auditId,
    tabId: snapshot.tabId,
    url: snapshot.url,
    timestamp: snapshot.timestamp,
    reportVersion: snapshot.reportVersion,
    overallScore: snapshot.enterpriseScoreResult.overallScore,
    issueCount: snapshot.analysisResult.issueCount,
  };
}

export class AuditSnapshotManager {
  async saveSnapshot(snapshot: AuditSnapshot): Promise<void> {
    await chrome.storage.local.set({ [snapshotKey(snapshot.auditId)]: snapshot });

    const index = await this.readIndex();
    const nextIndex = [
      snapshot.auditId,
      ...index.filter((id) => id !== snapshot.auditId),
    ];
    await chrome.storage.local.set({ [SNAPSHOT_INDEX_KEY]: nextIndex });
  }

  async loadSnapshot(auditId: string): Promise<AuditSnapshot | null> {
    const stored = await chrome.storage.local.get(snapshotKey(auditId));
    const snapshot = stored[snapshotKey(auditId)] as AuditSnapshot | undefined;
    return snapshot ?? null;
  }

  async listSnapshots(limit = MAX_SNAPSHOT_COUNT): Promise<AuditSnapshotSummary[]> {
    const index = await this.readIndex();
    const summaries: AuditSnapshotSummary[] = [];

    for (const auditId of index.slice(0, limit)) {
      const snapshot = await this.loadSnapshot(auditId);
      if (snapshot) {
        summaries.push(toSummary(snapshot));
      }
    }

    return summaries;
  }

  async deleteSnapshot(auditId: string): Promise<boolean> {
    const existing = await this.loadSnapshot(auditId);
    if (!existing) {
      return false;
    }

    await chrome.storage.local.remove(snapshotKey(auditId));
    const index = await this.readIndex();
    await chrome.storage.local.set({
      [SNAPSHOT_INDEX_KEY]: index.filter((id) => id !== auditId),
    });
    return true;
  }

  async cleanupOldSnapshots(maxCount = MAX_SNAPSHOT_COUNT): Promise<number> {
    const index = await this.readIndex();
    if (index.length <= maxCount) {
      return 0;
    }

    const staleIds = index.slice(maxCount);
    const keepIds = index.slice(0, maxCount);

    await chrome.storage.local.remove(staleIds.map(snapshotKey));
    await chrome.storage.local.set({ [SNAPSHOT_INDEX_KEY]: keepIds });
    return staleIds.length;
  }

  private async readIndex(): Promise<string[]> {
    const stored = await chrome.storage.local.get(SNAPSHOT_INDEX_KEY);
    const index = stored[SNAPSHOT_INDEX_KEY];
    return Array.isArray(index) ? (index as string[]) : [];
  }
}
