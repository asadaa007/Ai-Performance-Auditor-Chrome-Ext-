import type { Collector } from '@content/collectors/types';
import { createEmptyCSSResult } from '@content/collectors/defaults';
import type { CSSResult, StylesheetEntry } from '@shared/types';

function countCssVariables(text: string): number {
  const matches = text.match(/var\(--/g);
  return matches?.length ?? 0;
}

function analyzeStylesheet(sheet: CSSStyleSheet, index: number): StylesheetEntry {
  let ruleCount: number | null = null;
  let accessible = true;

  try {
    ruleCount = sheet.cssRules?.length ?? 0;
  } catch {
    accessible = false;
    ruleCount = null;
  }

  const href = sheet.href;
  const ownerNode = sheet.ownerNode;
  const isInline = ownerNode instanceof HTMLStyleElement;

  return {
    href: href ?? (isInline ? null : `inline-stylesheet-${index}`),
    type: isInline || !href ? 'inline' : 'external',
    ruleCount,
    accessible,
  };
}

export class CSSCollector implements Collector<CSSResult> {
  readonly name = 'css';

  async collect(): Promise<CSSResult> {
    const empty = createEmptyCSSResult();

    if (typeof document === 'undefined') {
      return empty;
    }

    const styleBlocks = Array.from(document.querySelectorAll('style'));
    const externalLinks = Array.from(
      document.querySelectorAll('link[rel="stylesheet"]'),
    ) as HTMLLinkElement[];
    const inlineStyleAttributeCount = document.querySelectorAll('[style]').length;

    const stylesheets: StylesheetEntry[] = [];
    let totalRuleCount = 0;
    let hasInaccessibleSheet = false;
    let cssVariableCount = 0;

    const sheetList = Array.from(document.styleSheets);
    for (let index = 0; index < sheetList.length; index += 1) {
      const analyzed = analyzeStylesheet(sheetList[index], index);
      stylesheets.push(analyzed);

      if (analyzed.accessible && analyzed.ruleCount !== null) {
        totalRuleCount += analyzed.ruleCount;
      } else {
        hasInaccessibleSheet = true;
      }

      try {
        const rules = sheetList[index].cssRules;
        if (rules) {
          for (const rule of Array.from(rules)) {
            cssVariableCount += countCssVariables(rule.cssText);
          }
        }
      } catch {
        // Cross-origin stylesheets cannot be read.
      }
    }

    for (const block of styleBlocks) {
      cssVariableCount += countCssVariables(block.textContent ?? '');
    }

    return {
      totalStylesheets: sheetList.length,
      inlineStyleBlocks: styleBlocks.length,
      externalStylesheets: externalLinks.length,
      inlineStyleAttributeCount,
      cssVariableCount,
      totalRuleCount: hasInaccessibleSheet && totalRuleCount === 0 ? null : totalRuleCount,
      estimatedUnusedRules: null,
      stylesheets,
      unusedStylesCoverageAvailable: false,
    };
  }
}
