export interface BestPracticesResult {
  hasDoctype: boolean;
  charsetDeclared: boolean;
  documentWriteUsage: boolean;
  unloadListenerCount: number;
  syncXhrInInlineScripts: boolean;
  deprecatedApiHits: string[];
  targetBlankWithoutNoopener: number;
  passiveEventListenerDetectionAvailable: boolean;
  detectedLibraries: string[];
  iframeWithoutSandbox: number;
  iframeWithoutTitle: number;
}
