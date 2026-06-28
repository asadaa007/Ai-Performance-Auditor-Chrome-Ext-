import { BestPracticesCollector } from '@content/collectors/BestPracticesCollector';
import { LongTasksCollector } from '@content/collectors/LongTasksCollector';
import { SecurityCollector } from '@content/collectors/SecurityCollector';
import { SeoCollector } from '@content/collectors/SeoCollector';
import {
  createEmptyAccessibilityResult,
  createEmptyBestPracticesResult,
  createEmptyCSSResult,
  createEmptyDOMResult,
  createEmptyFontsResult,
  createEmptyImagesResult,
  createEmptyJavaScriptResult,
  createEmptyLongTasksResult,
  createEmptyMetaResult,
  createEmptyNavigationTimingResult,
  createEmptyResourceTimingResult,
  createEmptySecurityResult,
  createEmptySeoResult,
  createEmptyStorageResult,
  createEmptyThirdPartyResult,
  createEmptyWebVitalsResult,
} from '@content/collectors/defaults';
import { AccessibilityCollector } from '@content/collectors/AccessibilityCollector';
import { CSSCollector } from '@content/collectors/CSSCollector';
import { DOMCollector } from '@content/collectors/DOMCollector';
import { FontsCollector } from '@content/collectors/FontsCollector';
import { ImagesCollector } from '@content/collectors/ImagesCollector';
import { JavaScriptCollector } from '@content/collectors/JavaScriptCollector';
import { MetaCollector } from '@content/collectors/MetaCollector';
import { NavigationTimingCollector } from '@content/collectors/NavigationTimingCollector';
import { ResourceTimingCollector } from '@content/collectors/ResourceTimingCollector';
import { StorageCollector } from '@content/collectors/StorageCollector';
import { ThirdPartyCollector } from '@content/collectors/ThirdPartyCollector';
import type { Collector } from '@content/collectors/types';
import { WebVitalsCollector } from '@content/collectors/WebVitalsCollector';
import { CollectorError, safeCollect } from '@content/utils/safe';
import { AuditCancelledError } from '@shared/errors';
import type { AuditCollectorError, AuditResult } from '@shared/types';

export interface AuditProgressEvent {
  collector: string;
  completedCollectors: number;
  totalCollectors: number;
  progress: number;
}

export interface AuditCollectionOptions {
  onProgress?: (event: AuditProgressEvent) => void;
  signal?: AbortSignal;
}

type AuditSections = Omit<AuditResult, 'meta'>;

const COLLECTOR_SECTION_KEYS: Record<string, keyof AuditSections> = {
  webVitals: 'webVitals',
  navigationTiming: 'navigationTiming',
  resources: 'resources',
  dom: 'dom',
  images: 'images',
  css: 'css',
  javascript: 'javascript',
  fonts: 'fonts',
  metaTags: 'metaTags',
  accessibility: 'accessibility',
  storage: 'storage',
  thirdParty: 'thirdParty',
  longTasks: 'longTasks',
  security: 'security',
  bestPractices: 'bestPractices',
  seo: 'seo',
};

const EMPTY_SECTIONS: AuditSections = {
  webVitals: createEmptyWebVitalsResult(),
  navigationTiming: createEmptyNavigationTimingResult(),
  resources: createEmptyResourceTimingResult(),
  dom: createEmptyDOMResult(),
  images: createEmptyImagesResult(),
  css: createEmptyCSSResult(),
  javascript: createEmptyJavaScriptResult(),
  fonts: createEmptyFontsResult(),
  metaTags: createEmptyMetaResult(),
  accessibility: createEmptyAccessibilityResult(),
  storage: createEmptyStorageResult(),
  thirdParty: createEmptyThirdPartyResult(),
  longTasks: createEmptyLongTasksResult(),
  security: createEmptySecurityResult(),
  bestPractices: createEmptyBestPracticesResult(),
  seo: createEmptySeoResult(),
};

function assignSection(sections: AuditSections, key: keyof AuditSections, value: unknown): void {
  switch (key) {
    case 'webVitals':
      sections.webVitals = value as AuditSections['webVitals'];
      break;
    case 'navigationTiming':
      sections.navigationTiming = value as AuditSections['navigationTiming'];
      break;
    case 'resources':
      sections.resources = value as AuditSections['resources'];
      break;
    case 'dom':
      sections.dom = value as AuditSections['dom'];
      break;
    case 'images':
      sections.images = value as AuditSections['images'];
      break;
    case 'css':
      sections.css = value as AuditSections['css'];
      break;
    case 'javascript':
      sections.javascript = value as AuditSections['javascript'];
      break;
    case 'fonts':
      sections.fonts = value as AuditSections['fonts'];
      break;
    case 'metaTags':
      sections.metaTags = value as AuditSections['metaTags'];
      break;
    case 'accessibility':
      sections.accessibility = value as AuditSections['accessibility'];
      break;
    case 'storage':
      sections.storage = value as AuditSections['storage'];
      break;
    case 'thirdParty':
      sections.thirdParty = value as AuditSections['thirdParty'];
      break;
    case 'longTasks':
      sections.longTasks = value as AuditSections['longTasks'];
      break;
    case 'security':
      sections.security = value as AuditSections['security'];
      break;
    case 'bestPractices':
      sections.bestPractices = value as AuditSections['bestPractices'];
      break;
    case 'seo':
      sections.seo = value as AuditSections['seo'];
      break;
  }
}

export class AuditCollector {
  private readonly collectors: Collector<unknown>[];

  constructor(collectors?: Collector<unknown>[]) {
    this.collectors = collectors ?? [
      new WebVitalsCollector(),
      new NavigationTimingCollector(),
      new ResourceTimingCollector(),
      new DOMCollector(),
      new ImagesCollector(),
      new CSSCollector(),
      new JavaScriptCollector(),
      new FontsCollector(),
      new MetaCollector(),
      new AccessibilityCollector(),
      new StorageCollector(),
      new ThirdPartyCollector(),
      new LongTasksCollector(),
      new SecurityCollector(),
      new BestPracticesCollector(),
      new SeoCollector(),
    ];
  }

  async collectAll(options?: AuditCollectionOptions): Promise<AuditResult> {
    const startedAt = performance.now();
    const errors: AuditCollectorError[] = [];
    const sections: AuditSections = { ...EMPTY_SECTIONS };
    const totalCollectors = this.collectors.length;

    for (let index = 0; index < this.collectors.length; index += 1) {
      if (options?.signal?.aborted) {
        throw new AuditCancelledError('Audit cancelled before collection completed.');
      }

      const collector = this.collectors[index];
      options?.onProgress?.({
        collector: collector.name,
        completedCollectors: index,
        totalCollectors,
        progress: Math.round((index / totalCollectors) * 100),
      });

      const result = await safeCollect(collector.name, () =>
        collector.collect({ signal: options?.signal }),
      );

      if (result instanceof CollectorError) {
        errors.push({ collector: result.collector, message: result.message });
      } else {
        const sectionKey = COLLECTOR_SECTION_KEYS[collector.name];
        if (sectionKey) {
          assignSection(sections, sectionKey, result);
        }
      }

      options?.onProgress?.({
        collector: collector.name,
        completedCollectors: index + 1,
        totalCollectors,
        progress: Math.round(((index + 1) / totalCollectors) * 100),
      });
    }

    return {
      ...sections,
      meta: {
        url: window.location.href,
        origin: window.location.origin,
        userAgent: navigator.userAgent,
        collectedAt: Date.now(),
        documentReadyState: document.readyState ?? null,
        collectorErrors: errors,
        collectionDurationMs: Math.round(performance.now() - startedAt),
      },
    };
  }
}
