export interface FontFaceEntry {
  family: string;
  style: string;
  weight: string;
  status: FontFaceLoadStatus;
  format: string | null;
}

export interface PreloadedFont {
  href: string;
  as: string | null;
  crossOrigin: string | null;
  type: string | null;
}

export interface FontsResult {
  fontFamilies: string[];
  fontFaces: FontFaceEntry[];
  preloadedFonts: PreloadedFont[];
  totalFontRequests: number;
  fontDisplayStrategies: Record<string, number>;
  documentFontsStatus: 'loaded' | 'loading' | 'unknown';
}
