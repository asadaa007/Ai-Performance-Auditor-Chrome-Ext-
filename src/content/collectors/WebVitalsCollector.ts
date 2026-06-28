import {
  buildVitalsMetric,
  detectVitalsCapabilities,
  getClsThresholds,
  getFcpThresholds,
  getInpThresholds,
  getLcpThresholds,
  getNavigationEntry,
  getTtfbThresholds,
  percentile98,
  readBufferedCls,
  readBufferedFcp,
  readBufferedInpDurations,
  readBufferedLcp,
  waitForVitalsCollection,
} from '@content/utils/performance';
import type { Collector } from '@content/collectors/types';
import { createEmptyWebVitalsResult } from '@content/collectors/defaults';
import type { WebVitalsResult } from '@shared/types';

const LCP_COLLECTION_WINDOW_MS = 3000;

export class WebVitalsCollector implements Collector<WebVitalsResult> {
  readonly name = 'webVitals';

  async collect(
    context?: import('@content/collectors/types').CollectorContext,
  ): Promise<WebVitalsResult> {
    const empty = createEmptyWebVitalsResult();

    if (typeof performance === 'undefined') {
      return empty;
    }

    const started = performance.now();
    const capabilities = detectVitalsCapabilities();

    let lcpValue = capabilities.lcp ? readBufferedLcp() : null;
    let clsValue = capabilities.cls ? readBufferedCls() : 0;
    const inpDurations = capabilities.inp ? readBufferedInpDurations() : [];
    const observers: PerformanceObserver[] = [];

    if (capabilities.lcp && typeof PerformanceObserver !== 'undefined') {
      try {
        const observer = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            lcpValue = Math.round(entry.startTime);
          }
        });
        observer.observe({ type: 'largest-contentful-paint', buffered: true });
        observers.push(observer);
      } catch {
        capabilities.lcp = false;
      }
    }

    if (capabilities.cls && typeof PerformanceObserver !== 'undefined') {
      try {
        const observer = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            const shift = entry as PerformanceEntry & {
              hadRecentInput?: boolean;
              value?: number;
            };
            if (shift.hadRecentInput) {
              continue;
            }
            if (typeof shift.value === 'number') {
              clsValue += shift.value;
            }
          }
        });
        observer.observe({ type: 'layout-shift', buffered: true });
        observers.push(observer);
      } catch {
        capabilities.cls = false;
      }
    }

    if (capabilities.inp && typeof PerformanceObserver !== 'undefined') {
      try {
        const observer = new PerformanceObserver((list) => {
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
        observers.push(observer);
      } catch {
        capabilities.inp = false;
      }
    }

    await waitForVitalsCollection(LCP_COLLECTION_WINDOW_MS, context?.signal);

    for (const observer of observers) {
      observer.disconnect();
    }

    if (capabilities.lcp && lcpValue === null) {
      lcpValue = readBufferedLcp();
    }

    if (capabilities.cls) {
      clsValue = Math.round(clsValue * 1000) / 1000;
    }

    const fcpValue = capabilities.fcp ? readBufferedFcp() : null;
    const navigation = getNavigationEntry();
    const ttfbValue =
      capabilities.ttfb && navigation
        ? Math.round(navigation.responseStart - navigation.requestStart)
        : null;
    const inpValue = inpDurations.length > 0 ? Math.round(percentile98(inpDurations) ?? 0) : null;

    const lcpConfidence =
      lcpValue !== null ? (observers.length > 0 ? 'high' : 'medium') : ('low' as const);
    const clsConfidence = capabilities.cls ? 'high' : 'low';
    const inpConfidence = inpDurations.length > 0 ? 'high' : 'low';

    return {
      lcp: buildVitalsMetric({
        value: lcpValue,
        unit: 'ms',
        thresholds: getLcpThresholds(),
        supported: capabilities.lcp,
        status: !capabilities.lcp ? 'not-supported' : lcpValue === null ? 'collecting' : 'measured',
        confidence: lcpConfidence,
      }),
      cls: buildVitalsMetric({
        value: capabilities.cls ? clsValue : null,
        unit: 'unitless',
        thresholds: getClsThresholds(),
        supported: capabilities.cls,
        status: !capabilities.cls ? 'not-supported' : 'measured',
        confidence: clsConfidence,
      }),
      inp: buildVitalsMetric({
        value: inpValue,
        unit: 'ms',
        thresholds: getInpThresholds(),
        supported: capabilities.inp,
        status: !capabilities.inp
          ? 'not-supported'
          : inpValue === null
            ? 'waiting-for-interaction'
            : 'measured',
        confidence: inpConfidence,
      }),
      fcp: buildVitalsMetric({
        value: fcpValue,
        unit: 'ms',
        thresholds: getFcpThresholds(),
        supported: capabilities.fcp,
        status: !capabilities.fcp ? 'not-supported' : fcpValue === null ? 'collecting' : 'measured',
        confidence: fcpValue !== null ? 'high' : 'medium',
      }),
      ttfb: buildVitalsMetric({
        value: ttfbValue,
        unit: 'ms',
        thresholds: getTtfbThresholds(),
        supported: capabilities.ttfb,
        status: !capabilities.ttfb
          ? 'not-supported'
          : ttfbValue === null
            ? 'collecting'
            : 'measured',
        confidence: ttfbValue !== null ? 'high' : 'low',
      }),
      collectedAt: Date.now(),
      collectionDurationMs: Math.round(performance.now() - started),
      capabilities,
      fromBufferedEntries: observers.length === 0,
    };
  }
}
