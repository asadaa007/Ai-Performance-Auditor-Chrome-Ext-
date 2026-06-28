export interface FrameworkProfile {
  primaryFramework: string;
  secondaryTechnologies: string[];
  buildTool: string | null;
  cms: string | null;
  uiLibrary: string | null;
  cssFramework: string | null;
  analyticsProviders: string[];
  hostingHints: string[];
  confidence: number;
}
