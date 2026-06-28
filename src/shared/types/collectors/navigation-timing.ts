export interface NavigationTimingMetric {
  value: number | null;
  unit: 'ms';
}

export interface NavigationTimingResult {
  dnsLookup: NavigationTimingMetric;
  tcpConnection: NavigationTimingMetric;
  tlsNegotiation: NavigationTimingMetric;
  redirectTime: NavigationTimingMetric;
  responseStart: NavigationTimingMetric;
  responseEnd: NavigationTimingMetric;
  domInteractive: NavigationTimingMetric;
  domComplete: NavigationTimingMetric;
  loadEvent: NavigationTimingMetric;
  transferSize: number | null;
  encodedBodySize: number | null;
  decodedBodySize: number | null;
  navigationType: string | null;
  protocol: string | null;
}
