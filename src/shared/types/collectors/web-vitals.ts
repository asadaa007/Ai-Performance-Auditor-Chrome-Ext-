export type VitalsMetricStatus =
  | 'measured'
  | 'collecting'
  | 'waiting-for-interaction'
  | 'not-measured'
  | 'not-supported';

export type VitalsConfidence = 'high' | 'medium' | 'low';

export interface WebVitalsMetric {
  value: number | null;
  rating: 'good' | 'needs-improvement' | 'poor' | 'unknown';
  unit: 'ms' | 'unitless' | 's';
  status: VitalsMetricStatus;
  confidence: VitalsConfidence;
  supported: boolean;
}

export interface WebVitalsCapabilities {
  lcp: boolean;
  cls: boolean;
  inp: boolean;
  fcp: boolean;
  ttfb: boolean;
}

export interface WebVitalsResult {
  lcp: WebVitalsMetric;
  cls: WebVitalsMetric;
  inp: WebVitalsMetric;
  fcp: WebVitalsMetric;
  ttfb: WebVitalsMetric;
  collectedAt: number;
  collectionDurationMs: number;
  capabilities: WebVitalsCapabilities;
  /** True when metrics were finalized from buffered entries without a live observation window. */
  fromBufferedEntries: boolean;
}
