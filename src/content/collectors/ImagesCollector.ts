import type { Collector } from '@content/collectors/types';
import { createEmptyImagesResult } from '@content/collectors/defaults';
import { getResourceTimingEntries } from '@content/utils/performance';
import { getImageFormat, isModernImageFormat } from '@content/utils/url';
import { OVERSIZED_IMAGE_RATIO } from '@shared/constants';
import type { ImageEntry, ImagesResult } from '@shared/types';

function getTransferSizeForSrc(src: string): number | null {
  const entries = getResourceTimingEntries();
  const match = entries.find((entry) => entry.name.includes(src) || src.includes(entry.name));
  return match?.transferSize ?? null;
}

function buildOptimizationOpportunities(
  image: Omit<ImageEntry, 'optimizationOpportunities'>,
): string[] {
  const opportunities: string[] = [];

  if (image.missingDimensions) {
    opportunities.push('missing-width-height');
  }

  if (image.lazyLoaded === false && image.displayHeight !== null && image.displayHeight < 200) {
    opportunities.push('consider-lazy-loading');
  }

  if (!image.isModernFormat && image.format) {
    opportunities.push('legacy-image-format');
  }

  if (
    image.naturalWidth !== null &&
    image.displayWidth !== null &&
    image.naturalWidth > image.displayWidth * OVERSIZED_IMAGE_RATIO
  ) {
    opportunities.push('oversized-image');
  }

  if (image.transferSize !== null && image.transferSize > 200_000) {
    opportunities.push('large-file-size');
  }

  return opportunities;
}

export class ImagesCollector implements Collector<ImagesResult> {
  readonly name = 'images';

  async collect(): Promise<ImagesResult> {
    const empty = createEmptyImagesResult();

    if (typeof document === 'undefined') {
      return empty;
    }

    const imageElements = Array.from(document.querySelectorAll('img'));
    const images: ImageEntry[] = imageElements.map((img) => {
      const src = img.currentSrc || img.src || '';
      const format = getImageFormat(src);
      const isModernFormat = isModernImageFormat(format);
      const lazyLoaded = img.loading === 'lazy' || img.getAttribute('loading') === 'lazy';
      const missingDimensions =
        !img.hasAttribute('width') ||
        !img.hasAttribute('height') ||
        img.width === 0 ||
        img.height === 0;

      const partial: Omit<ImageEntry, 'optimizationOpportunities'> = {
        src,
        naturalWidth: img.naturalWidth > 0 ? img.naturalWidth : null,
        naturalHeight: img.naturalHeight > 0 ? img.naturalHeight : null,
        displayWidth: img.width > 0 ? img.width : null,
        displayHeight: img.height > 0 ? img.height : null,
        transferSize: getTransferSizeForSrc(src),
        lazyLoaded,
        missingDimensions,
        format,
        isModernFormat,
        loading: img.getAttribute('loading'),
      };

      return {
        ...partial,
        optimizationOpportunities: buildOptimizationOpportunities(partial),
      };
    });

    const oversizedCount = images.filter((image) =>
      image.optimizationOpportunities.includes('oversized-image'),
    ).length;

    return {
      totalImages: images.length,
      lazyLoadedCount: images.filter((image) => image.lazyLoaded).length,
      missingDimensionsCount: images.filter((image) => image.missingDimensions).length,
      modernFormatCount: images.filter((image) => image.isModernFormat).length,
      legacyFormatCount: images.filter((image) => image.format && !image.isModernFormat).length,
      oversizedCount,
      images,
    };
  }
}
