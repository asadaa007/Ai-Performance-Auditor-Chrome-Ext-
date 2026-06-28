import { AI_STORAGE_KEY } from '@features/ai/types/config';
import { SERVICE_WORKER_KEEPALIVE_PORT } from '@shared/utils/serviceWorkerKeepAlive';

const KEEPALIVE_PING_MS = 20_000;

export function registerServiceWorkerKeepAlive(): void {
  chrome.runtime.onConnect.addListener((port) => {
    if (port.name !== SERVICE_WORKER_KEEPALIVE_PORT) {
      return;
    }

    port.onMessage.addListener(() => undefined);
    port.onDisconnect.addListener(() => undefined);
  });
}

export async function runWithServiceWorkerKeepAlive<T>(task: () => Promise<T>): Promise<T> {
  const intervalId = setInterval(() => {
    void chrome.storage.local.get(AI_STORAGE_KEY).catch(() => undefined);
  }, KEEPALIVE_PING_MS);

  try {
    return await task();
  } finally {
    clearInterval(intervalId);
  }
}
