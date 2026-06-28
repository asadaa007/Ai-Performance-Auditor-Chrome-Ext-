import type { Collector } from '@content/collectors/types';
import { createEmptyResourceTimingResult } from '@content/collectors/defaults';
import { getResourceTimingEntries } from '@content/utils/performance';
import { normalizeUrl } from '@content/utils/url';
import { SLOW_RESOURCE_THRESHOLD_MS } from '@shared/constants';
import type { ResourceEntry, ResourceTimingResult } from '@shared/types';

function mapResourceEntry(entry: PerformanceResourceTiming): ResourceEntry {
  const transferSize = entry.transferSize ?? null;
  const encodedBodySize = entry.encodedBodySize ?? null;
  const decodedBodySize = entry.decodedBodySize ?? null;
  const fromCache = transferSize === 0 && decodedBodySize !== null && decodedBodySize > 0;
  let compressed: boolean | null = null;
  let compressionRatio: number | null = null;

  if (
    encodedBodySize !== null &&
    transferSize !== null &&
    encodedBodySize > 0 &&
    transferSize > 0
  ) {
    compressionRatio = Math.round((transferSize / encodedBodySize) * 100) / 100;
    compressed = compressionRatio < 0.95;
  }

  return {
    name: entry.name,
    initiatorType: entry.initiatorType,
    duration: Math.round(entry.duration),
    transferSize,
    encodedBodySize,
    decodedBodySize,
    fromCache,
    startTime: Math.round(entry.startTime),
    compressed,
    compressionRatio,
  };
}

function isJsResource(entry: ResourceEntry): boolean {
  return (
    entry.initiatorType === 'script' ||
    /\.m?js(\?|$)/i.test(entry.name) ||
    entry.name.includes('javascript')
  );
}

function isCssResource(entry: ResourceEntry): boolean {
  return entry.initiatorType === 'css' || /\.css(\?|$)/i.test(entry.name);
}

function isImageResource(entry: ResourceEntry): boolean {
  return (
    entry.initiatorType === 'img' ||
    /\.(png|jpe?g|gif|webp|avif|svg|ico|bmp)(\?|$)/i.test(entry.name)
  );
}

function isFontResource(entry: ResourceEntry): boolean {
  return entry.initiatorType === 'font' || /\.(woff2?|ttf|otf|eot)(\?|$)/i.test(entry.name);
}

function isFetchXhr(entry: ResourceEntry): boolean {
  return entry.initiatorType === 'fetch' || entry.initiatorType === 'xmlhttprequest';
}

export class ResourceTimingCollector implements Collector<ResourceTimingResult> {
  readonly name = 'resources';

  async collect(): Promise<ResourceTimingResult> {
    const empty = createEmptyResourceTimingResult();

    if (typeof performance === 'undefined') {
      return empty;
    }

    const rawEntries = getResourceTimingEntries().map(mapResourceEntry);
    const byInitiatorType: Record<string, number> = {};

    for (const entry of rawEntries) {
      byInitiatorType[entry.initiatorType] = (byInitiatorType[entry.initiatorType] ?? 0) + 1;
    }

    const urlGroups = new Map<string, ResourceEntry[]>();
    for (const entry of rawEntries) {
      const key = normalizeUrl(entry.name);
      const group = urlGroups.get(key) ?? [];
      group.push(entry);
      urlGroups.set(key, group);
    }

    const duplicateResources = Array.from(urlGroups.entries())
      .filter(([, entries]) => entries.length > 1)
      .map(([url, entries]) => ({
        url,
        count: entries.length,
        entries,
      }));

    const uncompressedTextResources = rawEntries.filter((entry) => {
      if (!/\.(js|css|html|json|svg|xml|txt)(\?|$)/i.test(entry.name)) {
        return false;
      }
      return entry.compressed === false;
    });

    const preconnectHints = Array.from(document.querySelectorAll('link[rel="preconnect"]'))
      .map((link) => (link as HTMLLinkElement).href)
      .filter(Boolean);

    const preloadHints = Array.from(document.querySelectorAll('link[rel="preload"]')).map(
      (link) => ({
        href: (link as HTMLLinkElement).href,
        as: link.getAttribute('as'),
      }),
    );

    const renderBlockingResources: ResourceTimingResult['renderBlockingResources'] = [];
    const head = document.head;
    if (head) {
      for (const script of Array.from(head.querySelectorAll('script[src]'))) {
        const el = script as HTMLScriptElement;
        const src = el.src;
        if (!src) continue;
        const isModule = el.type === 'module';
        const blocking = !el.async && !el.defer && !isModule;
        renderBlockingResources.push({ url: src, type: 'script', blocking });
      }
      for (const link of Array.from(head.querySelectorAll('link[rel="stylesheet"]'))) {
        const href = (link as HTMLLinkElement).href;
        if (!href) continue;
        renderBlockingResources.push({ url: href, type: 'stylesheet', blocking: true });
      }
    }

    return {
      totalRequests: rawEntries.length,
      totalTransferSize: rawEntries.reduce((sum, entry) => sum + (entry.transferSize ?? 0), 0),
      totalEncodedSize: rawEntries.reduce((sum, entry) => sum + (entry.encodedBodySize ?? 0), 0),
      totalDecodedSize: rawEntries.reduce((sum, entry) => sum + (entry.decodedBodySize ?? 0), 0),
      jsFiles: rawEntries.filter(isJsResource),
      cssFiles: rawEntries.filter(isCssResource),
      images: rawEntries.filter(isImageResource),
      fonts: rawEntries.filter(isFontResource),
      fetchXhr: rawEntries.filter(isFetchXhr),
      cachedResources: rawEntries.filter((entry) => entry.fromCache),
      slowResources: rawEntries.filter((entry) => entry.duration >= SLOW_RESOURCE_THRESHOLD_MS),
      uncompressedTextResources,
      renderBlockingResources,
      preconnectHints,
      preloadHints,
      duplicateResources,
      byInitiatorType,
    };
  }
}
