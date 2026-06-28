import type { Collector } from '@content/collectors/types';
import { createEmptyStorageResult } from '@content/collectors/defaults';
import { estimateStorageSize } from '@content/utils/url';
import type { StorageResult } from '@shared/types';

function readWebStorage(storage: Storage): StorageResult['localStorage'] {
  const keys: string[] = [];
  let estimatedSizeBytes = 0;

  for (let index = 0; index < storage.length; index += 1) {
    const key = storage.key(index);
    if (!key) {
      continue;
    }

    const value = storage.getItem(key) ?? '';
    keys.push(key);
    estimatedSizeBytes += estimateStorageSize(key) + estimateStorageSize(value);
  }

  return {
    keyCount: keys.length,
    estimatedSizeBytes,
    keys: keys.slice(0, 100),
  };
}

function readCookies(): StorageResult['cookies'] {
  const raw = document.cookie;
  if (!raw) {
    return { count: 0, estimatedSizeBytes: 0, names: [] };
  }

  const pairs = raw
    .split(';')
    .map((part) => part.trim())
    .filter(Boolean);
  const names = pairs
    .map((pair) => pair.split('=')[0]?.trim())
    .filter((name): name is string => Boolean(name));

  return {
    count: names.length,
    estimatedSizeBytes: estimateStorageSize(raw),
    names: names.slice(0, 100),
  };
}

async function readIndexedDB(): Promise<StorageResult['indexedDB']> {
  if (!('indexedDB' in window) || typeof indexedDB.databases !== 'function') {
    return { available: false, databaseNames: [] };
  }

  try {
    const databases = await indexedDB.databases();
    return {
      available: true,
      databaseNames: databases
        .map((database) => database.name)
        .filter((name): name is string => Boolean(name)),
    };
  } catch {
    return { available: true, databaseNames: [] };
  }
}

export class StorageCollector implements Collector<StorageResult> {
  readonly name = 'storage';

  async collect(): Promise<StorageResult> {
    const empty = createEmptyStorageResult();

    if (typeof window === 'undefined') {
      return empty;
    }

    let localStorageData = empty.localStorage;
    let sessionStorageData = empty.sessionStorage;

    try {
      localStorageData = readWebStorage(window.localStorage);
    } catch {
      localStorageData = empty.localStorage;
    }

    try {
      sessionStorageData = readWebStorage(window.sessionStorage);
    } catch {
      sessionStorageData = empty.sessionStorage;
    }

    return {
      localStorage: localStorageData,
      sessionStorage: sessionStorageData,
      cookies: readCookies(),
      indexedDB: await readIndexedDB(),
    };
  }
}
