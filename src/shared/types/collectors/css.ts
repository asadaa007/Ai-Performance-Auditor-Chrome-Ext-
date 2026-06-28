export interface StylesheetEntry {
  href: string | null;
  type: 'inline' | 'external';
  ruleCount: number | null;
  accessible: boolean;
}

export interface CSSResult {
  totalStylesheets: number;
  inlineStyleBlocks: number;
  externalStylesheets: number;
  inlineStyleAttributeCount: number;
  cssVariableCount: number;
  totalRuleCount: number | null;
  estimatedUnusedRules: number | null;
  stylesheets: StylesheetEntry[];
  /** Coverage API is DevTools-only; null when unavailable. */
  unusedStylesCoverageAvailable: boolean;
}
