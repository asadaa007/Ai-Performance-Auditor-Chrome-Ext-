export interface ImageEntry {
  src: string;
  naturalWidth: number | null;
  naturalHeight: number | null;
  displayWidth: number | null;
  displayHeight: number | null;
  transferSize: number | null;
  lazyLoaded: boolean;
  missingDimensions: boolean;
  format: string | null;
  isModernFormat: boolean;
  loading: string | null;
  optimizationOpportunities: string[];
}

export interface ImagesResult {
  totalImages: number;
  lazyLoadedCount: number;
  missingDimensionsCount: number;
  modernFormatCount: number;
  legacyFormatCount: number;
  oversizedCount: number;
  images: ImageEntry[];
}
