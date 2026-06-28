export interface ResourceEntry {
  name: string;
  initiatorType: string;
  duration: number;
  transferSize: number | null;
  encodedBodySize: number | null;
  decodedBodySize: number | null;
  fromCache: boolean;
  startTime: number;
  compressed: boolean | null;
  compressionRatio: number | null;
}

export interface ResourceTimingResult {
  totalRequests: number;
  totalTransferSize: number;
  totalEncodedSize: number;
  totalDecodedSize: number;
  jsFiles: ResourceEntry[];
  cssFiles: ResourceEntry[];
  images: ResourceEntry[];
  fonts: ResourceEntry[];
  fetchXhr: ResourceEntry[];
  cachedResources: ResourceEntry[];
  slowResources: ResourceEntry[];
  uncompressedTextResources: ResourceEntry[];
  renderBlockingResources: Array<{
    url: string;
    type: 'script' | 'stylesheet';
    blocking: boolean;
  }>;
  preconnectHints: string[];
  preloadHints: Array<{ href: string; as: string | null }>;
  duplicateResources: Array<{
    url: string;
    count: number;
    entries: ResourceEntry[];
  }>;
  byInitiatorType: Record<string, number>;
}
