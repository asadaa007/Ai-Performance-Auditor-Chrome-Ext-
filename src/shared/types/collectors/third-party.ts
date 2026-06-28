export type ThirdPartyCategory =
  | 'analytics'
  | 'tag-manager'
  | 'facebook-pixel'
  | 'hotjar'
  | 'intercom'
  | 'cdn'
  | 'advertising'
  | 'social'
  | 'other';

export interface ThirdPartyDetection {
  category: ThirdPartyCategory;
  provider: string;
  url: string;
  source: 'script' | 'resource' | 'iframe' | 'beacon';
}

export interface ThirdPartyResult {
  detections: ThirdPartyDetection[];
  thirdPartyRequestCount: number;
  thirdPartyTransferSize: number;
  uniqueThirdPartyDomains: string[];
  byCategory: Record<ThirdPartyCategory, number>;
}
