import type { Collector } from '@content/collectors/types';
import { createEmptySeoResult } from '@content/collectors/defaults';
import type { SeoResult, StructuredDataBlock } from '@shared/types';

function parseStructuredData(): StructuredDataBlock[] {
  const blocks: StructuredDataBlock[] = [];
  for (const script of Array.from(
    document.querySelectorAll('script[type="application/ld+json"]'),
  )) {
    const raw = script.textContent?.trim() ?? '';
    if (!raw) {
      continue;
    }

    try {
      const parsed = JSON.parse(raw) as { '@type'?: string };
      const type = Array.isArray(parsed['@type'])
        ? parsed['@type'].join(', ')
        : (parsed['@type'] ?? null);
      blocks.push({ type, rawLength: raw.length, valid: true, error: null });
    } catch (error) {
      blocks.push({
        type: null,
        rawLength: raw.length,
        valid: false,
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }
  return blocks;
}

export class SeoCollector implements Collector<SeoResult> {
  readonly name = 'seo';

  async collect(): Promise<SeoResult> {
    const empty = createEmptySeoResult();
    if (typeof document === 'undefined') {
      return empty;
    }

    const title = document.title ?? '';
    const description =
      document.querySelector('meta[name="description"]')?.getAttribute('content') ?? '';
    const robots = document.querySelector('meta[name="robots"]')?.getAttribute('content') ?? '';
    const h1Count = document.querySelectorAll('h1').length;

    const hreflangLinks = Array.from(document.querySelectorAll('link[rel="alternate"][hreflang]'))
      .map((link) => ({
        hreflang: link.getAttribute('hreflang') ?? '',
        href: (link as HTMLLinkElement).href,
      }))
      .filter((link) => link.hreflang && link.href);

    const sitemapUrls = Array.from(document.querySelectorAll('link[rel="sitemap"]')).map(
      (link) => (link as HTMLLinkElement).href,
    );

    const internalLinkCount = Array.from(document.querySelectorAll('a[href]')).filter((anchor) => {
      try {
        const href = (anchor as HTMLAnchorElement).href;
        return href.startsWith(window.location.origin);
      } catch {
        return false;
      }
    }).length;

    const robotsTxtUrl = `${window.location.origin}/robots.txt`;
    let robotsTxtReachable: boolean | null = null;
    let robotsTxtStatus: number | null = null;
    let robotsTxtError: string | null = null;

    try {
      const response = await fetch(robotsTxtUrl, { method: 'GET', cache: 'no-store' });
      robotsTxtStatus = response.status;
      robotsTxtReachable = response.ok;
    } catch (error) {
      robotsTxtReachable = false;
      robotsTxtError = error instanceof Error ? error.message : String(error);
    }

    return {
      titleLength: title.length,
      descriptionLength: description.length,
      hasH1: h1Count > 0,
      h1Count,
      hreflangLinks,
      structuredData: parseStructuredData(),
      robotsTxtUrl,
      robotsTxtReachable,
      robotsTxtStatus,
      robotsTxtError,
      sitemapUrls,
      hasNoindex: /noindex/i.test(robots),
      hasNofollow: /nofollow/i.test(robots),
      duplicateTitleRisk: h1Count > 1,
      internalLinkCount,
      brokenInternalLinkCandidates: [],
    };
  }
}
