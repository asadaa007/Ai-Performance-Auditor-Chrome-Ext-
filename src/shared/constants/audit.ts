export const SLOW_RESOURCE_THRESHOLD_MS = 1000;

export const WEB_VITALS_THRESHOLDS = {
  lcp: { good: 2500, poor: 4000 },
  cls: { good: 0.1, poor: 0.25 },
  inp: { good: 200, poor: 500 },
  fcp: { good: 1800, poor: 3000 },
  ttfb: { good: 800, poor: 1800 },
} as const;

export const OVERSIZED_IMAGE_RATIO = 1.5;

export const THIRD_PARTY_PROVIDERS: Array<{
  category: import('@shared/types').ThirdPartyDetection['category'];
  provider: string;
  patterns: RegExp[];
}> = [
  {
    category: 'analytics',
    provider: 'Google Analytics',
    patterns: [/google-analytics\.com/i, /googletagmanager\.com\/gtag/i, /analytics\.google\.com/i],
  },
  {
    category: 'tag-manager',
    provider: 'Google Tag Manager',
    patterns: [/googletagmanager\.com\/gtm\.js/i],
  },
  {
    category: 'facebook-pixel',
    provider: 'Facebook Pixel',
    patterns: [/connect\.facebook\.net/i, /facebook\.com\/tr/i],
  },
  {
    category: 'hotjar',
    provider: 'Hotjar',
    patterns: [/static\.hotjar\.com/i, /script\.hotjar\.com/i],
  },
  {
    category: 'intercom',
    provider: 'Intercom',
    patterns: [/widget\.intercom\.io/i, /js\.intercomcdn\.com/i],
  },
  {
    category: 'analytics',
    provider: 'Segment',
    patterns: [/cdn\.segment\.com/i, /api\.segment\.io/i],
  },
  {
    category: 'analytics',
    provider: 'Mixpanel',
    patterns: [/cdn\.mxpnl\.com/i, /api\.mixpanel\.com/i],
  },
  {
    category: 'cdn',
    provider: 'Cloudflare CDN',
    patterns: [/cdnjs\.cloudflare\.com/i, /cdn-cgi\//i],
  },
  {
    category: 'cdn',
    provider: 'jsDelivr',
    patterns: [/cdn\.jsdelivr\.net/i],
  },
  {
    category: 'cdn',
    provider: 'unpkg',
    patterns: [/unpkg\.com/i],
  },
  {
    category: 'advertising',
    provider: 'Google Ads',
    patterns: [/googleadservices\.com/i, /doubleclick\.net/i],
  },
  {
    category: 'social',
    provider: 'Twitter/X',
    patterns: [/platform\.twitter\.com/i, /syndication\.twitter\.com/i],
  },
];
