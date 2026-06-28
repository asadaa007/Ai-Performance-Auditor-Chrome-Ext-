import { WEB_VITALS_THRESHOLDS } from '@shared/constants';
import type {
  VitalsConfidence,
  VitalsMetricStatus,
  WebVitalsCapabilities,
  WebVitalsMetric,
} from '@shared/types';

export function getNavigationEntry(): PerformanceNavigationTiming | null {
  const entries = performance.getEntriesByType('navigation');
  const entry = entries[entries.length - 1];
  return entry instanceof PerformanceNavigationTiming ? entry : null;
}

export function getResourceTimingEntries(): PerformanceResourceTiming[] {
  return performance
    .getEntriesByType('resource')
    .filter(
      (entry): entry is PerformanceResourceTiming => entry instanceof PerformanceResourceTiming,
    );
}

export function timingDelta(end: number, start: number): number | null {
  if (!Number.isFinite(end) || !Number.isFinite(start) || end < start) {
    return null;
  }
  return Math.round(end - start);
}

export function detectVitalsCapabilities(): WebVitalsCapabilities {
  const supportedTypes =
    typeof PerformanceObserver !== 'undefined'
      ? (PerformanceObserver.supportedEntryTypes ?? [])
      : [];

  return {
    lcp: supportedTypes.includes('largest-contentful-paint'),
    cls: supportedTypes.includes('layout-shift'),
    inp: supportedTypes.includes('event'),
    fcp:
      typeof performance !== 'undefined' &&
      performance.getEntriesByName('first-contentful-paint').length >= 0,
    ttfb: typeof performance !== 'undefined' && Boolean(getNavigationEntry()),
  };
}

export function readBufferedLcp(): number | null {
  const entries = performance.getEntriesByType('largest-contentful-paint');
  const last = entries[entries.length - 1];
  return last ? Math.round(last.startTime) : null;
}

export function readBufferedCls(): number {
  const entries = performance.getEntriesByType('layout-shift');
  let cls = 0;
  for (const entry of entries) {
    const shift = entry as PerformanceEntry & { hadRecentInput?: boolean; value?: number };
    if (shift.hadRecentInput) {
      continue;
    }
    if (typeof shift.value === 'number') {
      cls += shift.value;
    }
  }
  return Math.round(cls * 1000) / 1000;
}

export function readBufferedFcp(): number | null {
  const fcp = performance.getEntriesByName('first-contentful-paint')[0];
  return fcp ? Math.round(fcp.startTime) : null;
}

export function readBufferedInpDurations(): number[] {
  return performance
    .getEntriesByType('event')
    .filter((entry): entry is PerformanceEventTiming => {
      return (
        'interactionId' in entry &&
        typeof entry.interactionId === 'number' &&
        entry.interactionId > 0 &&
        entry.duration > 0
      );
    })
    .map((entry) => entry.duration);
}

export function percentile98(values: number[]): number | null {
  if (values.length === 0) {
    return null;
  }
  const sorted = [...values].sort((a, b) => a - b);
  const index = Math.min(sorted.length - 1, Math.floor(sorted.length * 0.98));
  return sorted[index] ?? sorted[sorted.length - 1] ?? null;
}

export function waitForVitalsCollection(timeoutMs: number, signal?: AbortSignal): Promise<void> {
  return new Promise((resolve) => {
    let settled = false;

    const finish = () => {
      if (settled) {
        return;
      }
      settled = true;
      document.removeEventListener('visibilitychange', onVisibilityChange);
      signal?.removeEventListener('abort', onAbort);
      clearTimeout(timeoutId);
      resolve();
    };

    const onVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        finish();
      }
    };

    const onAbort = () => {
      finish();
    };

    if (signal?.aborted) {
      resolve();
      return;
    }

    document.addEventListener('visibilitychange', onVisibilityChange);
    signal?.addEventListener('abort', onAbort, { once: true });
    const timeoutId = window.setTimeout(finish, timeoutMs);
  });
}

export function rateMetric(
  value: number | null,
  thresholds: { good: number; poor: number },
  higherIsBetter = false,
): WebVitalsMetric['rating'] {
  if (value === null || !Number.isFinite(value)) {
    return 'unknown';
  }

  if (higherIsBetter) {
    if (value >= thresholds.good) return 'good';
    if (value >= thresholds.poor) return 'needs-improvement';
    return 'poor';
  }

  if (value <= thresholds.good) return 'good';
  if (value <= thresholds.poor) return 'needs-improvement';
  return 'poor';
}

export function buildVitalsMetric({
  value,
  unit,
  thresholds,
  supported,
  status,
  confidence,
}: {
  value: number | null;
  unit: WebVitalsMetric['unit'];
  thresholds: { good: number; poor: number };
  supported: boolean;
  status: VitalsMetricStatus;
  confidence: VitalsConfidence;
}): WebVitalsMetric {
  const resolvedStatus = supported ? status : 'not-supported';
  const rating = resolvedStatus === 'measured' ? rateMetric(value, thresholds) : 'unknown';

  return {
    value: resolvedStatus === 'measured' ? value : null,
    unit,
    rating,
    status: resolvedStatus,
    confidence,
    supported,
  };
}

export function createVitalsMetric(
  value: number | null,
  unit: WebVitalsMetric['unit'],
  thresholds: { good: number; poor: number },
): WebVitalsMetric {
  return buildVitalsMetric({
    value,
    unit,
    thresholds,
    supported: true,
    status: value === null ? 'collecting' : 'measured',
    confidence: value === null ? 'low' : 'high',
  });
}

export function getLcpThresholds() {
  return WEB_VITALS_THRESHOLDS.lcp;
}

export function getClsThresholds() {
  return WEB_VITALS_THRESHOLDS.cls;
}

export function getInpThresholds() {
  return WEB_VITALS_THRESHOLDS.inp;
}

export function getFcpThresholds() {
  return WEB_VITALS_THRESHOLDS.fcp;
}

export function getTtfbThresholds() {
  return WEB_VITALS_THRESHOLDS.ttfb;
}

export function waitForObserver<T>(
  observe: (observer: PerformanceObserver) => void,
  read: () => T | null,
  timeoutMs: number,
): Promise<T | null> {
  return new Promise((resolve) => {
    let settled = false;

    const finish = (value: T | null) => {
      if (settled) return;
      settled = true;
      observer?.disconnect();
      clearTimeout(timeoutId);
      resolve(value);
    };

    let observer: PerformanceObserver | null = null;

    if (typeof PerformanceObserver === 'undefined') {
      finish(read());
      return;
    }

    try {
      observer = new PerformanceObserver(() => {
        finish(read());
      });
      observe(observer);
    } catch {
      finish(read());
      return;
    }

    const existing = read();
    if (existing !== null) {
      finish(existing);
      return;
    }

    const timeoutId = window.setTimeout(() => finish(read()), timeoutMs);
  });
}
