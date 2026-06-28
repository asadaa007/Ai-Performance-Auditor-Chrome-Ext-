import type { Collector } from '@content/collectors/types';
import { createEmptyThirdPartyResult } from '@content/collectors/defaults';
import { getResourceTimingEntries } from '@content/utils/performance';
import { getHostname, isThirdPartyUrl } from '@content/utils/url';
import { THIRD_PARTY_PROVIDERS } from '@shared/constants';
import type { ThirdPartyCategory, ThirdPartyDetection, ThirdPartyResult } from '@shared/types';

function detectProvider(url: string): ThirdPartyDetection | null {
  for (const provider of THIRD_PARTY_PROVIDERS) {
    if (provider.patterns.some((pattern) => pattern.test(url))) {
      return {
        category: provider.category,
        provider: provider.provider,
        url,
        source: 'resource',
      };
    }
  }
  return null;
}

function uniqueByUrl(detections: ThirdPartyDetection[]): ThirdPartyDetection[] {
  const seen = new Set<string>();
  const unique: ThirdPartyDetection[] = [];

  for (const detection of detections) {
    const key = `${detection.provider}:${detection.url}`;
    if (seen.has(key)) {
      continue;
    }
    seen.add(key);
    unique.push(detection);
  }

  return unique;
}

export class ThirdPartyCollector implements Collector<ThirdPartyResult> {
  readonly name = 'thirdParty';

  async collect(): Promise<ThirdPartyResult> {
    const empty = createEmptyThirdPartyResult();
    const pageOrigin = window.location.origin;
    const detections: ThirdPartyDetection[] = [];

    const resources = getResourceTimingEntries();
    for (const resource of resources) {
      if (!isThirdPartyUrl(resource.name, pageOrigin)) {
        continue;
      }

      const detected = detectProvider(resource.name);
      if (detected) {
        detections.push(detected);
      }
    }

    for (const script of Array.from(document.querySelectorAll('script[src]'))) {
      const src = (script as HTMLScriptElement).src;
      if (!src || !isThirdPartyUrl(src, pageOrigin)) {
        continue;
      }

      const detected = detectProvider(src);
      detections.push(
        detected ?? {
          category: 'other',
          provider: getHostname(src) ?? 'unknown',
          url: src,
          source: 'script',
        },
      );
    }

    for (const iframe of Array.from(document.querySelectorAll('iframe[src]'))) {
      const src = (iframe as HTMLIFrameElement).src;
      if (!src || !isThirdPartyUrl(src, pageOrigin)) {
        continue;
      }

      const detected = detectProvider(src);
      detections.push(
        detected ?? {
          category: 'other',
          provider: getHostname(src) ?? 'unknown',
          url: src,
          source: 'iframe',
        },
      );
    }

    const uniqueDetections = uniqueByUrl(detections);
    const byCategory = { ...empty.byCategory };

    for (const detection of uniqueDetections) {
      const category: ThirdPartyCategory = detection.category;
      byCategory[category] = (byCategory[category] ?? 0) + 1;
    }

    const thirdPartyResources = resources.filter((resource) =>
      isThirdPartyUrl(resource.name, pageOrigin),
    );

    const uniqueThirdPartyDomains = Array.from(
      new Set(
        thirdPartyResources
          .map((resource) => getHostname(resource.name))
          .filter((hostname): hostname is string => Boolean(hostname)),
      ),
    );

    return {
      detections: uniqueDetections,
      thirdPartyRequestCount: thirdPartyResources.length,
      thirdPartyTransferSize: thirdPartyResources.reduce(
        (sum, resource) => sum + (resource.transferSize ?? 0),
        0,
      ),
      uniqueThirdPartyDomains,
      byCategory,
    };
  }
}
