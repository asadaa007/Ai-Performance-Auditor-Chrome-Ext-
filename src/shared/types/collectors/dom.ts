export interface DOMResult {
  totalNodes: number;
  maxDepth: number;
  scriptCount: number;
  stylesheetCount: number;
  iframeCount: number;
  shadowRootCount: number;
  elementCounts: Record<string, number>;
  bodyChildCount: number;
  documentReadyState: DocumentReadyState | null;
}
