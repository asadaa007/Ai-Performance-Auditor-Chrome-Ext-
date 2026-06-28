export const ANALYSIS_THRESHOLDS = {
  largeImageBytes: 200_000,
  domNodeCount: 1_500,
  domMaxDepth: 32,
  scriptCount: 20,
  stylesheetCount: 10,
  storageBytes: 500_000,
  cookieCount: 20,
  thirdPartyRequestCount: 15,
  totalTransferBytes: 3_000_000,
  slowResourceCount: 3,
  fontFamilyCount: 8,
  duplicateResourceCount: 1,
  missingLazyLoadRatio: 0.5,
  missingDimensionsCount: 3,
  largeImageCount: 2,
} as const;

export const WEB_VITALS_DOC_LINKS = {
  lcp: 'https://web.dev/articles/lcp',
  cls: 'https://web.dev/articles/cls',
  inp: 'https://web.dev/articles/inp',
  fcp: 'https://web.dev/articles/fcp',
  ttfb: 'https://web.dev/articles/ttfb',
} as const;
