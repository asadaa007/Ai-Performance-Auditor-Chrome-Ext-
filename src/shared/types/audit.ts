import type { AccessibilityResult } from './collectors/accessibility';
import type { BestPracticesResult } from './collectors/best-practices';
import type { CSSResult, StylesheetEntry } from './collectors/css';
import type { DOMResult } from './collectors/dom';
import type { FontFaceEntry, FontsResult, PreloadedFont } from './collectors/fonts';
import type { ImageEntry, ImagesResult } from './collectors/images';
import type { JavaScriptResult, ScriptEntry } from './collectors/javascript';
import type { LongTasksResult } from './collectors/long-tasks';
import type { MetaResult } from './collectors/meta';
import type { NavigationTimingResult } from './collectors/navigation-timing';
import type { ResourceEntry, ResourceTimingResult } from './collectors/resource-timing';
import type { SecurityResult, HeaderPresence } from './collectors/security';
import type { SeoResult, StructuredDataBlock } from './collectors/seo';
import type { StorageResult } from './collectors/storage';
import type {
  ThirdPartyCategory,
  ThirdPartyDetection,
  ThirdPartyResult,
} from './collectors/third-party';
import type {
  VitalsConfidence,
  VitalsMetricStatus,
  WebVitalsCapabilities,
  WebVitalsMetric,
  WebVitalsResult,
} from './collectors/web-vitals';

export interface AuditCollectionMeta {
  url: string;
  origin: string;
  userAgent: string;
  collectedAt: number;
  documentReadyState: DocumentReadyState | null;
  collectorErrors: AuditCollectorError[];
  collectionDurationMs: number;
}

export interface AuditCollectorError {
  collector: string;
  message: string;
}

export interface AuditResult {
  meta: AuditCollectionMeta;
  webVitals: WebVitalsResult;
  navigationTiming: NavigationTimingResult;
  resources: ResourceTimingResult;
  dom: DOMResult;
  images: ImagesResult;
  css: CSSResult;
  javascript: JavaScriptResult;
  fonts: FontsResult;
  metaTags: MetaResult;
  accessibility: AccessibilityResult;
  storage: StorageResult;
  thirdParty: ThirdPartyResult;
  longTasks: LongTasksResult;
  security: SecurityResult;
  bestPractices: BestPracticesResult;
  seo: SeoResult;
}

export type {
  AccessibilityResult,
  BestPracticesResult,
  CSSResult,
  DOMResult,
  FontFaceEntry,
  FontsResult,
  HeaderPresence,
  ImageEntry,
  ImagesResult,
  JavaScriptResult,
  LongTasksResult,
  MetaResult,
  NavigationTimingResult,
  PreloadedFont,
  ResourceEntry,
  ResourceTimingResult,
  ScriptEntry,
  SecurityResult,
  SeoResult,
  StorageResult,
  StructuredDataBlock,
  StylesheetEntry,
  ThirdPartyCategory,
  ThirdPartyDetection,
  ThirdPartyResult,
  VitalsConfidence,
  VitalsMetricStatus,
  WebVitalsCapabilities,
  WebVitalsMetric,
  WebVitalsResult,
};
