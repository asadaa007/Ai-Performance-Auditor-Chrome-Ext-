export const SERVICE_WORKER_KEEPALIVE_PORT = 'ai-explain-keepalive';

/**
 * Holds an open runtime port so the MV3 service worker stays alive during long AI work.
 * Call the returned function to release the connection.
 */
export function connectServiceWorkerKeepAlive(): () => void {
  if (typeof chrome === 'undefined' || !chrome.runtime?.connect) {
    return () => undefined;
  }

  const port = chrome.runtime.connect({ name: SERVICE_WORKER_KEEPALIVE_PORT });

  return () => {
    try {
      port.disconnect();
    } catch {
      // Port may already be closed.
    }
  };
}
