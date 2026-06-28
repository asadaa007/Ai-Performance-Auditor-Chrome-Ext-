import type {
  AccessibilityResult,
  AuditResult,
  BestPracticesResult,
  CSSResult,
  DOMResult,
  FontsResult,
  ImagesResult,
  JavaScriptResult,
  LongTasksResult,
  MetaResult,
  NavigationTimingResult,
  ResourceTimingResult,
  SecurityResult,
  SeoResult,
  StorageResult,
  ThirdPartyResult,
  WebVitalsResult,
} from '@shared/types';

const emptyVitalsMetric = {
  value: null,
  rating: 'unknown' as const,
  unit: 'ms' as const,
  status: 'collecting' as const,
  confidence: 'low' as const,
  supported: false,
};

const emptyNavigationMetric = { value: null, unit: 'ms' as const };

export function createEmptyWebVitalsResult(): WebVitalsResult {
  return {
    lcp: { ...emptyVitalsMetric, unit: 'ms' },
    cls: { ...emptyVitalsMetric, unit: 'unitless' },
    inp: { ...emptyVitalsMetric, unit: 'ms' },
    fcp: { ...emptyVitalsMetric, unit: 'ms' },
    ttfb: { ...emptyVitalsMetric, unit: 'ms' },
    collectedAt: Date.now(),
    collectionDurationMs: 0,
    capabilities: {
      lcp: false,
      cls: false,
      inp: false,
      fcp: false,
      ttfb: false,
    },
    fromBufferedEntries: true,
  };
}

export function createEmptyNavigationTimingResult(): NavigationTimingResult {
  return {
    dnsLookup: { ...emptyNavigationMetric },
    tcpConnection: { ...emptyNavigationMetric },
    tlsNegotiation: { ...emptyNavigationMetric },
    redirectTime: { ...emptyNavigationMetric },
    responseStart: { ...emptyNavigationMetric },
    responseEnd: { ...emptyNavigationMetric },
    domInteractive: { ...emptyNavigationMetric },
    domComplete: { ...emptyNavigationMetric },
    loadEvent: { ...emptyNavigationMetric },
    transferSize: null,
    encodedBodySize: null,
    decodedBodySize: null,
    navigationType: null,
    protocol: null,
  };
}

export function createEmptyResourceTimingResult(): ResourceTimingResult {
  return {
    totalRequests: 0,
    totalTransferSize: 0,
    totalEncodedSize: 0,
    totalDecodedSize: 0,
    jsFiles: [],
    cssFiles: [],
    images: [],
    fonts: [],
    fetchXhr: [],
    cachedResources: [],
    slowResources: [],
    uncompressedTextResources: [],
    renderBlockingResources: [],
    preconnectHints: [],
    preloadHints: [],
    duplicateResources: [],
    byInitiatorType: {},
  };
}

export function createEmptyDOMResult(): DOMResult {
  return {
    totalNodes: 0,
    maxDepth: 0,
    scriptCount: 0,
    stylesheetCount: 0,
    iframeCount: 0,
    shadowRootCount: 0,
    elementCounts: {},
    bodyChildCount: 0,
    documentReadyState: null,
  };
}

export function createEmptyImagesResult(): ImagesResult {
  return {
    totalImages: 0,
    lazyLoadedCount: 0,
    missingDimensionsCount: 0,
    modernFormatCount: 0,
    legacyFormatCount: 0,
    oversizedCount: 0,
    images: [],
  };
}

export function createEmptyCSSResult(): CSSResult {
  return {
    totalStylesheets: 0,
    inlineStyleBlocks: 0,
    externalStylesheets: 0,
    inlineStyleAttributeCount: 0,
    cssVariableCount: 0,
    totalRuleCount: null,
    estimatedUnusedRules: null,
    stylesheets: [],
    unusedStylesCoverageAvailable: false,
  };
}

export function createEmptyJavaScriptResult(): JavaScriptResult {
  return {
    totalScripts: 0,
    inlineScripts: 0,
    externalScripts: 0,
    moduleScripts: 0,
    asyncScripts: 0,
    deferScripts: 0,
    thirdPartyScripts: 0,
    scripts: [],
  };
}

export function createEmptyFontsResult(): FontsResult {
  return {
    fontFamilies: [],
    fontFaces: [],
    preloadedFonts: [],
    totalFontRequests: 0,
    fontDisplayStrategies: {},
    documentFontsStatus: 'unknown',
  };
}

export function createEmptyMetaResult(): MetaResult {
  return {
    title: null,
    description: null,
    canonicalUrl: null,
    viewport: null,
    robots: null,
    charset: null,
    openGraph: {},
    twitter: {},
    otherMeta: {},
  };
}

export function createEmptyAccessibilityResult(): AccessibilityResult {
  return {
    missingAltCount: 0,
    missingAltElements: [],
    missingFormLabelsCount: 0,
    missingFormLabelElements: [],
    hasLangAttribute: false,
    langValue: null,
    ariaRoleCount: 0,
    ariaLabelCount: 0,
    ariaLabelledByCount: 0,
    ariaDescribedByCount: 0,
    ariaHiddenCount: 0,
    headingCount: 0,
    headingLevels: {},
    focusableElementCount: 0,
    headingOrderViolations: 0,
    duplicateIds: [],
    buttonsWithoutName: [],
    linksWithoutName: [],
    positiveTabIndexCount: 0,
    landmarkMainCount: 0,
    landmarkNavCount: 0,
    iframeMissingTitle: 0,
    invalidAriaRoles: [],
    tablesWithoutHeaders: 0,
    listsWithInvalidStructure: 0,
    lowContrastSamples: [],
    contrastSamplingAvailable: false,
  };
}

export function createEmptyStorageResult(): StorageResult {
  return {
    localStorage: { keyCount: 0, estimatedSizeBytes: 0, keys: [] },
    sessionStorage: { keyCount: 0, estimatedSizeBytes: 0, keys: [] },
    cookies: { count: 0, estimatedSizeBytes: 0, names: [] },
    indexedDB: { available: false, databaseNames: [] },
  };
}

export function createEmptyThirdPartyResult(): ThirdPartyResult {
  return {
    detections: [],
    thirdPartyRequestCount: 0,
    thirdPartyTransferSize: 0,
    uniqueThirdPartyDomains: [],
    byCategory: {
      analytics: 0,
      'tag-manager': 0,
      'facebook-pixel': 0,
      hotjar: 0,
      intercom: 0,
      cdn: 0,
      advertising: 0,
      social: 0,
      other: 0,
    },
  };
}

export function createEmptyLongTasksResult(): LongTasksResult {
  return {
    supported: false,
    longTaskCount: 0,
    totalBlockingTime: 0,
    longestTaskMs: 0,
    tasks: [],
  };
}

export function createEmptySecurityResult(): SecurityResult {
  return {
    isHttps: false,
    pageProtocol: '',
    mixedContentUrls: [],
    mixedContentCount: 0,
    hasCspMeta: false,
    cspMetaContent: null,
    responseHeaders: {
      strictTransportSecurity: 'unknown',
      xFrameOptions: 'unknown',
      xContentTypeOptions: 'unknown',
      referrerPolicy: 'unknown',
      contentSecurityPolicy: 'unknown',
      crossOriginOpenerPolicy: 'unknown',
      crossOriginEmbedderPolicy: 'unknown',
      crossOriginResourcePolicy: 'unknown',
      permissionsPolicy: 'unknown',
    },
    headerFetchSucceeded: false,
    headerFetchError: null,
    cookieCount: 0,
    visibleInsecureCookieFlags: 0,
    crossOriginIsolated: false,
  };
}

export function createEmptyBestPracticesResult(): BestPracticesResult {
  return {
    hasDoctype: false,
    charsetDeclared: false,
    documentWriteUsage: false,
    unloadListenerCount: 0,
    syncXhrInInlineScripts: false,
    deprecatedApiHits: [],
    targetBlankWithoutNoopener: 0,
    passiveEventListenerDetectionAvailable: false,
    detectedLibraries: [],
    iframeWithoutSandbox: 0,
    iframeWithoutTitle: 0,
  };
}

export function createEmptySeoResult(): SeoResult {
  return {
    titleLength: 0,
    descriptionLength: 0,
    hasH1: false,
    h1Count: 0,
    hreflangLinks: [],
    structuredData: [],
    robotsTxtUrl: null,
    robotsTxtReachable: null,
    robotsTxtStatus: null,
    robotsTxtError: null,
    sitemapUrls: [],
    hasNoindex: false,
    hasNofollow: false,
    duplicateTitleRisk: false,
    internalLinkCount: 0,
    brokenInternalLinkCandidates: [],
  };
}

export function createEmptyAuditResult(): AuditResult {
  return {
    meta: {
      url: '',
      origin: '',
      userAgent: '',
      collectedAt: Date.now(),
      documentReadyState: null,
      collectorErrors: [],
      collectionDurationMs: 0,
    },
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
}
