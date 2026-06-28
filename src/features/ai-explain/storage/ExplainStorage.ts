import { EXPLAIN_CACHE_KEY, EXPLAIN_HISTORY_KEY } from '@features/ai-explain/storage/constants';
import type { ExplainCacheEntry } from '@features/ai-explain/types';

export class ExplainCache {
  async get(promptHash: string): Promise<ExplainCacheEntry | null> {
    const stored = await chrome.storage.local.get(EXPLAIN_CACHE_KEY);
    const cache = stored[EXPLAIN_CACHE_KEY] as Record<string, ExplainCacheEntry> | undefined;
    return cache?.[promptHash] ?? null;
  }

  async set(promptHash: string, entry: ExplainCacheEntry): Promise<void> {
    const stored = await chrome.storage.local.get(EXPLAIN_CACHE_KEY);
    const cache =
      (stored[EXPLAIN_CACHE_KEY] as Record<string, ExplainCacheEntry> | undefined) ?? {};
    cache[promptHash] = entry;
    await chrome.storage.local.set({ [EXPLAIN_CACHE_KEY]: cache });
  }

  async clear(): Promise<void> {
    await chrome.storage.local.remove(EXPLAIN_CACHE_KEY);
  }
}

export const explainCache = new ExplainCache();

export class ExplainHistory {
  private readonly maxEntries = 50;

  async list(): Promise<import('@features/ai-explain/types').ExplainHistoryEntry[]> {
    const stored = await chrome.storage.local.get(EXPLAIN_HISTORY_KEY);
    return (
      (stored[EXPLAIN_HISTORY_KEY] as import('@features/ai-explain/types').ExplainHistoryEntry[]) ??
      []
    );
  }

  async append(entry: import('@features/ai-explain/types').ExplainHistoryEntry): Promise<void> {
    const current = await this.list();
    const next = [entry, ...current.filter((item) => item.promptHash !== entry.promptHash)].slice(
      0,
      this.maxEntries,
    );
    await chrome.storage.local.set({ [EXPLAIN_HISTORY_KEY]: next });
  }

  async clear(): Promise<void> {
    await chrome.storage.local.remove(EXPLAIN_HISTORY_KEY);
  }
}

export const explainHistory = new ExplainHistory();
