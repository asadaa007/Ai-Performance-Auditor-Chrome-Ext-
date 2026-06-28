import type { AuditCollectorError } from '@shared/types';

export interface CollectorContext {
  signal?: AbortSignal;
}

export interface Collector<T> {
  readonly name: string;
  collect(context?: CollectorContext): Promise<T>;
}

export type CollectorResultMap = {
  webVitals: import('@shared/types').WebVitalsResult;
  navigationTiming: import('@shared/types').NavigationTimingResult;
  resources: import('@shared/types').ResourceTimingResult;
  dom: import('@shared/types').DOMResult;
  images: import('@shared/types').ImagesResult;
  css: import('@shared/types').CSSResult;
  javascript: import('@shared/types').JavaScriptResult;
  fonts: import('@shared/types').FontsResult;
  metaTags: import('@shared/types').MetaResult;
  accessibility: import('@shared/types').AccessibilityResult;
  storage: import('@shared/types').StorageResult;
  thirdParty: import('@shared/types').ThirdPartyResult;
  longTasks: import('@shared/types').LongTasksResult;
  security: import('@shared/types').SecurityResult;
  bestPractices: import('@shared/types').BestPracticesResult;
  seo: import('@shared/types').SeoResult;
};

export function toCollectorError(error: AuditCollectorError): AuditCollectorError {
  return error;
}
