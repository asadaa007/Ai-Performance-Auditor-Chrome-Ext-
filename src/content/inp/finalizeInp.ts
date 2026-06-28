import {
  buildVitalsMetric,
  getInpThresholds,
  percentile98,
  readBufferedInpDurations,
} from '@content/utils/performance';
import type { AuditResult } from '@shared/types';

const INP_WAIT_MS = 10_000;

const INTERACTION_EVENTS = ['click', 'keydown', 'pointerdown', 'scroll', 'wheel', 'touchstart'] as const;

export async function finalizeInpIfNeeded(
  result: AuditResult,
  options?: {
    signal?: AbortSignal;
    onStatus?: (message: string) => void;
  },
): Promise<AuditResult> {
  const inp = result.webVitals.inp;
  if (!inp.supported || inp.status !== 'waiting-for-interaction') {
    return result;
  }

  if (options?.signal?.aborted) {
    return result;
  }

  options?.onStatus?.('Waiting for first interaction…');

  const inpDurations = [...readBufferedInpDurations()];
  let observer: PerformanceObserver | null = null;

  if (typeof PerformanceObserver !== 'undefined') {
    try {
      observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          const event = entry as PerformanceEventTiming & { interactionId?: number };
          if ((event.interactionId ?? 0) > 0 && event.duration > 0) {
            inpDurations.push(event.duration);
          }
        }
      });
      observer.observe({
        type: 'event',
        buffered: true,
        durationThreshold: 0,
      } as PerformanceObserverInit);
    } catch {
      observer = null;
    }
  }

  const hadInteraction = await waitForFirstInteraction(INP_WAIT_MS, options?.signal);

  if (options?.signal?.aborted) {
    observer?.disconnect();
    return result;
  }

  if (hadInteraction) {
    await delay(150, options?.signal);
  }

  observer?.disconnect();

  const inpValue =
    inpDurations.length > 0 ? Math.round(percentile98(inpDurations) ?? 0) : null;

  if (inpValue !== null) {
    options?.onStatus?.('INP captured');
  }

  options?.onStatus?.('Finalizing report…');

  const nextInp =
    inpValue !== null
      ? buildVitalsMetric({
          value: inpValue,
          unit: 'ms',
          thresholds: getInpThresholds(),
          supported: true,
          status: 'measured',
          confidence: 'high',
        })
      : buildVitalsMetric({
          value: null,
          unit: 'ms',
          thresholds: getInpThresholds(),
          supported: true,
          status: 'not-measured',
          confidence: 'low',
        });

  return {
    ...result,
    webVitals: {
      ...result.webVitals,
      inp: nextInp,
    },
  };
}

function waitForFirstInteraction(timeoutMs: number, signal?: AbortSignal): Promise<boolean> {
  return new Promise((resolve) => {
    let settled = false;

    const finish = (hadInteraction: boolean) => {
      if (settled) {
        return;
      }
      settled = true;
      for (const eventName of INTERACTION_EVENTS) {
        window.removeEventListener(eventName, onInteraction, listenerOptions);
      }
      signal?.removeEventListener('abort', onAbort);
      clearTimeout(timeoutId);
      resolve(hadInteraction);
    };

    const listenerOptions: AddEventListenerOptions = { capture: true, passive: true };

    const onInteraction = () => {
      finish(true);
    };

    const onAbort = () => {
      finish(false);
    };

    if (signal?.aborted) {
      resolve(false);
      return;
    }

    for (const eventName of INTERACTION_EVENTS) {
      window.addEventListener(eventName, onInteraction, listenerOptions);
    }

    signal?.addEventListener('abort', onAbort, { once: true });
    const timeoutId = window.setTimeout(() => finish(false), timeoutMs);
  });
}

function delay(ms: number, signal?: AbortSignal): Promise<void> {
  return new Promise((resolve) => {
    if (signal?.aborted) {
      resolve();
      return;
    }

    const timeoutId = window.setTimeout(() => {
      signal?.removeEventListener('abort', onAbort);
      resolve();
    }, ms);

    const onAbort = () => {
      clearTimeout(timeoutId);
      resolve();
    };

    signal?.addEventListener('abort', onAbort, { once: true });
  });
}
