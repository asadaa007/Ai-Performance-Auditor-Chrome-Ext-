export interface StructuredDataBlock {
  type: string | null;
  rawLength: number;
  valid: boolean;
  error: string | null;
}

export interface SeoResult {
  titleLength: number;
  descriptionLength: number;
  hasH1: boolean;
  h1Count: number;
  hreflangLinks: Array<{ hreflang: string; href: string }>;
  structuredData: StructuredDataBlock[];
  robotsTxtUrl: string | null;
  robotsTxtReachable: boolean | null;
  robotsTxtStatus: number | null;
  robotsTxtError: string | null;
  sitemapUrls: string[];
  hasNoindex: boolean;
  hasNofollow: boolean;
  duplicateTitleRisk: boolean;
  internalLinkCount: number;
  brokenInternalLinkCandidates: string[];
}
