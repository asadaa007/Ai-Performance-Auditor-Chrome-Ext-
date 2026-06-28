import type { Collector } from '@content/collectors/types';
import { createEmptyBestPracticesResult } from '@content/collectors/defaults';
import type { BestPracticesResult } from '@shared/types';

const DEPRECATED_PATTERNS = [
  'webkitStorageInfo',
  'ApplicationCache',
  'createTouchList',
  'showModalDialog',
  'HTMLMarqueeElement',
];

const LIBRARY_PATTERNS: Array<{ pattern: RegExp; name: string }> = [
  { pattern: /jquery/i, name: 'jQuery' },
  { pattern: /react(?:\.production)?/i, name: 'React' },
  { pattern: /vue(?:\.runtime)?/i, name: 'Vue' },
  { pattern: /angular/i, name: 'Angular' },
  { pattern: /bootstrap/i, name: 'Bootstrap' },
  { pattern: /gtag|google-analytics|googletagmanager/i, name: 'Google Analytics' },
];

export class BestPracticesCollector implements Collector<BestPracticesResult> {
  readonly name = 'bestPractices';

  async collect(): Promise<BestPracticesResult> {
    const empty = createEmptyBestPracticesResult();
    if (typeof document === 'undefined') {
      return empty;
    }

    const doctype = document.doctype;
    const hasDoctype = Boolean(doctype?.name?.toLowerCase() === 'html');

    const inlineScripts = Array.from(document.querySelectorAll('script:not([src])'));
    const documentWriteUsage = inlineScripts.some((script) =>
      (script.textContent ?? '').includes('document.write'),
    );
    const syncXhrInInlineScripts = inlineScripts.some((script) =>
      /new\s+XMLHttpRequest\(\)[\s\S]*\.open\(\s*['"][^'"]+['"]\s*,[\s\S]*false\s*\)/.test(
        script.textContent ?? '',
      ),
    );

    const deprecatedApiHits: string[] = [];
    const pageText = Array.from(document.querySelectorAll('script'))
      .map((script) => script.textContent ?? script.src)
      .join('\n');
    for (const pattern of DEPRECATED_PATTERNS) {
      if (pageText.includes(pattern)) {
        deprecatedApiHits.push(pattern);
      }
    }

    const detectedLibraries = new Set<string>();
    for (const script of Array.from(document.querySelectorAll('script[src]'))) {
      const src = script.getAttribute('src') ?? '';
      for (const lib of LIBRARY_PATTERNS) {
        if (lib.pattern.test(src)) {
          detectedLibraries.add(lib.name);
        }
      }
    }

    let targetBlankWithoutNoopener = 0;
    for (const anchor of Array.from(document.querySelectorAll('a[target="_blank"]'))) {
      const rel = anchor.getAttribute('rel') ?? '';
      if (!rel.toLowerCase().includes('noopener')) {
        targetBlankWithoutNoopener += 1;
      }
    }

    let iframeWithoutSandbox = 0;
    let iframeWithoutTitle = 0;
    for (const iframe of Array.from(document.querySelectorAll('iframe'))) {
      if (!iframe.hasAttribute('sandbox')) {
        iframeWithoutSandbox += 1;
      }
      if (!iframe.getAttribute('title')?.trim()) {
        iframeWithoutTitle += 1;
      }
    }

    return {
      hasDoctype,
      charsetDeclared: Boolean(document.characterSet),
      documentWriteUsage,
      unloadListenerCount: 0,
      syncXhrInInlineScripts,
      deprecatedApiHits,
      targetBlankWithoutNoopener,
      passiveEventListenerDetectionAvailable: false,
      detectedLibraries: Array.from(detectedLibraries),
      iframeWithoutSandbox,
      iframeWithoutTitle,
    };
  }
}
