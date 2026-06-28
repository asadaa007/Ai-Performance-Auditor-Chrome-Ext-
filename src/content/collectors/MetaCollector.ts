import type { Collector } from '@content/collectors/types';
import { createEmptyMetaResult } from '@content/collectors/defaults';
import type { MetaResult } from '@shared/types';

function readMetaContent(name: string): string | null {
  const element = document.querySelector(`meta[name="${name}"]`);
  return element?.getAttribute('content') ?? null;
}

export class MetaCollector implements Collector<MetaResult> {
  readonly name = 'metaTags';

  async collect(): Promise<MetaResult> {
    const empty = createEmptyMetaResult();

    if (typeof document === 'undefined') {
      return empty;
    }

    const openGraph: Record<string, string> = {};
    const twitter: Record<string, string> = {};
    const otherMeta: Record<string, string> = {};

    const metaElements = Array.from(document.querySelectorAll('meta'));
    for (const meta of metaElements) {
      const property = meta.getAttribute('property');
      const name = meta.getAttribute('name');
      const content = meta.getAttribute('content');

      if (!content) {
        continue;
      }

      if (property?.startsWith('og:')) {
        openGraph[property] = content;
        continue;
      }

      if (name?.startsWith('twitter:')) {
        twitter[name] = content;
        continue;
      }

      if (name && !['description', 'viewport', 'robots'].includes(name)) {
        otherMeta[name] = content;
      }
    }

    const canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;

    return {
      title: document.title || null,
      description: readMetaContent('description'),
      canonicalUrl: canonical?.href ?? null,
      viewport: readMetaContent('viewport'),
      robots: readMetaContent('robots'),
      charset: document.characterSet || readMetaContent('charset'),
      openGraph,
      twitter,
      otherMeta,
    };
  }
}
