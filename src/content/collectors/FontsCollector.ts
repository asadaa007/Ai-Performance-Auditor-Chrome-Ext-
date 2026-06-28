import type { Collector } from '@content/collectors/types';
import { createEmptyFontsResult } from '@content/collectors/defaults';
import { getResourceTimingEntries } from '@content/utils/performance';
import type { FontFaceEntry, FontsResult, PreloadedFont } from '@shared/types';

function detectFontFormat(url: string): string | null {
  const match = url.match(/\.(woff2?|ttf|otf|eot)(\?|$)/i);
  return match?.[1]?.toLowerCase() ?? null;
}

export class FontsCollector implements Collector<FontsResult> {
  readonly name = 'fonts';

  async collect(): Promise<FontsResult> {
    const empty = createEmptyFontsResult();

    if (typeof document === 'undefined') {
      return empty;
    }

    const fontFaces: FontFaceEntry[] = [];
    const fontFamilies = new Set<string>();
    const fontDisplayStrategies: Record<string, number> = {};

    if (document.fonts) {
      for (const face of document.fonts) {
        fontFamilies.add(face.family);
        fontFaces.push({
          family: face.family,
          style: face.style,
          weight: face.weight,
          status: face.status,
          format: null,
        });
      }

      try {
        const fontFaceRules = Array.from(document.styleSheets).flatMap((sheet) => {
          try {
            return Array.from(sheet.cssRules).filter(
              (rule): rule is CSSFontFaceRule => rule instanceof CSSFontFaceRule,
            );
          } catch {
            return [];
          }
        });

        for (const rule of fontFaceRules) {
          const family = rule.style.getPropertyValue('font-family').replace(/['"]/g, '').trim();
          const display = rule.style.getPropertyValue('font-display').trim() || 'auto';
          if (family) {
            fontFamilies.add(family);
            fontDisplayStrategies[display] = (fontDisplayStrategies[display] ?? 0) + 1;
          }

          const src = rule.style.getPropertyValue('src');
          const format = detectFontFormat(src);
          if (format && family) {
            const existing = fontFaces.find(
              (face) => face.family === family && face.format === null,
            );
            if (existing) {
              existing.format = format;
            }
          }
        }
      } catch {
        // Ignore stylesheet access errors.
      }
    }

    const preloadedFonts: PreloadedFont[] = Array.from(
      document.querySelectorAll(
        'link[rel="preload"][as="font"], link[rel="preload"][type*="font"]',
      ),
    ).map((link) => {
      const element = link as HTMLLinkElement;
      return {
        href: element.href,
        as: element.getAttribute('as'),
        crossOrigin: element.getAttribute('crossorigin'),
        type: element.getAttribute('type'),
      };
    });

    const fontResources = getResourceTimingEntries().filter(
      (entry) => entry.initiatorType === 'font' || /\.(woff2?|ttf|otf|eot)(\?|$)/i.test(entry.name),
    );

    let documentFontsStatus: FontsResult['documentFontsStatus'] = 'unknown';
    if (document.fonts) {
      documentFontsStatus = document.fonts.status === 'loaded' ? 'loaded' : 'loading';
    }

    return {
      fontFamilies: Array.from(fontFamilies),
      fontFaces,
      preloadedFonts,
      totalFontRequests: fontResources.length,
      fontDisplayStrategies,
      documentFontsStatus,
    };
  }
}
