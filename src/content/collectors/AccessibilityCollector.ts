import type { Collector } from '@content/collectors/types';
import { createEmptyAccessibilityResult } from '@content/collectors/defaults';
import { elementSelector } from '@content/utils/url';
import type { AccessibilityResult } from '@shared/types';

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

const VALID_ROLES = new Set([
  'alert',
  'button',
  'checkbox',
  'dialog',
  'img',
  'link',
  'listbox',
  'main',
  'navigation',
  'option',
  'radio',
  'tab',
  'tabpanel',
  'textbox',
]);

function hasAssociatedLabel(input: HTMLElement): boolean {
  if (input.id) {
    const label = document.querySelector(`label[for="${CSS.escape(input.id)}"]`);
    if (label) {
      return true;
    }
  }
  return Boolean(input.closest('label'));
}

function hasAccessibleName(element: HTMLElement): boolean {
  const text = element.textContent?.trim();
  if (text) return true;
  if (element.getAttribute('aria-label')?.trim()) return true;
  if (element.getAttribute('aria-labelledby')?.trim()) return true;
  if (element.getAttribute('title')?.trim()) return true;
  return false;
}

function sampleContrast(): AccessibilityResult['lowContrastSamples'] {
  const samples: AccessibilityResult['lowContrastSamples'] = [];
  const candidates = Array.from(document.querySelectorAll('p, span, a, button, h1, h2, h3, li'))
    .slice(0, 20)
    .filter((el) => (el.textContent?.trim().length ?? 0) > 0);

  for (const element of candidates) {
    const style = window.getComputedStyle(element);
    const color = style.color;
    const background = style.backgroundColor;
    if (!color || !background || background === 'rgba(0, 0, 0, 0)') {
      continue;
    }
    samples.push({ selector: elementSelector(element), ratio: null });
  }

  return samples;
}

export class AccessibilityCollector implements Collector<AccessibilityResult> {
  readonly name = 'accessibility';

  async collect(): Promise<AccessibilityResult> {
    const empty = createEmptyAccessibilityResult();

    if (typeof document === 'undefined') {
      return empty;
    }

    const missingAltElements: string[] = [];
    for (const img of Array.from(document.querySelectorAll('img'))) {
      const alt = img.getAttribute('alt');
      if (alt === null || alt.trim() === '') {
        missingAltElements.push(elementSelector(img));
      }
    }

    const missingFormLabelElements: string[] = [];
    const formControls = Array.from(
      document.querySelectorAll('input, select, textarea'),
    ) as HTMLElement[];

    for (const control of formControls) {
      const type = control.getAttribute('type');
      if (type === 'hidden' || type === 'submit' || type === 'button') {
        continue;
      }
      const hasAriaLabel =
        control.hasAttribute('aria-label') || control.hasAttribute('aria-labelledby');
      if (!hasAssociatedLabel(control) && !hasAriaLabel) {
        missingFormLabelElements.push(elementSelector(control));
      }
    }

    const headingLevels: Record<string, number> = {};
    const headings = Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, h6'));
    let headingOrderViolations = 0;
    let previousLevel = 0;
    for (const heading of headings) {
      const level = Number(heading.tagName.slice(1));
      headingLevels[heading.tagName.toLowerCase()] =
        (headingLevels[heading.tagName.toLowerCase()] ?? 0) + 1;
      if (previousLevel > 0 && level - previousLevel > 1) {
        headingOrderViolations += 1;
      }
      previousLevel = level;
    }

    const idMap = new Map<string, number>();
    for (const element of Array.from(document.querySelectorAll('[id]'))) {
      const id = element.id;
      idMap.set(id, (idMap.get(id) ?? 0) + 1);
    }
    const duplicateIds = Array.from(idMap.entries())
      .filter(([, count]) => count > 1)
      .map(([id]) => id)
      .slice(0, 20);

    const buttonsWithoutName: string[] = [];
    for (const button of Array.from(document.querySelectorAll('button'))) {
      if (!hasAccessibleName(button)) {
        buttonsWithoutName.push(elementSelector(button));
      }
    }

    const linksWithoutName: string[] = [];
    for (const link of Array.from(document.querySelectorAll('a[href]'))) {
      if (!hasAccessibleName(link as HTMLElement)) {
        linksWithoutName.push(elementSelector(link));
      }
    }

    const positiveTabIndexCount = document.querySelectorAll(
      '[tabindex]:not([tabindex="-1"])',
    ).length;
    const invalidAriaRoles = Array.from(document.querySelectorAll('[role]'))
      .map((element) => element.getAttribute('role') ?? '')
      .filter((role) => role && !VALID_ROLES.has(role))
      .slice(0, 20);

    let tablesWithoutHeaders = 0;
    for (const table of Array.from(document.querySelectorAll('table'))) {
      if (!table.querySelector('th')) {
        tablesWithoutHeaders += 1;
      }
    }

    let listsWithInvalidStructure = 0;
    for (const list of Array.from(document.querySelectorAll('ul, ol'))) {
      const invalidChild = Array.from(list.children).some(
        (child) => child.tagName.toLowerCase() !== 'li',
      );
      if (invalidChild) {
        listsWithInvalidStructure += 1;
      }
    }

    const htmlElement = document.documentElement;
    const lowContrastSamples = sampleContrast();

    return {
      missingAltCount: missingAltElements.length,
      missingAltElements: missingAltElements.slice(0, 50),
      missingFormLabelsCount: missingFormLabelElements.length,
      missingFormLabelElements: missingFormLabelElements.slice(0, 50),
      hasLangAttribute: htmlElement.hasAttribute('lang'),
      langValue: htmlElement.getAttribute('lang'),
      ariaRoleCount: document.querySelectorAll('[role]').length,
      ariaLabelCount: document.querySelectorAll('[aria-label]').length,
      ariaLabelledByCount: document.querySelectorAll('[aria-labelledby]').length,
      ariaDescribedByCount: document.querySelectorAll('[aria-describedby]').length,
      ariaHiddenCount: document.querySelectorAll('[aria-hidden="true"]').length,
      headingCount: headings.length,
      headingLevels,
      focusableElementCount: document.querySelectorAll(FOCUSABLE_SELECTOR).length,
      headingOrderViolations,
      duplicateIds,
      buttonsWithoutName: buttonsWithoutName.slice(0, 30),
      linksWithoutName: linksWithoutName.slice(0, 30),
      positiveTabIndexCount,
      landmarkMainCount: document.querySelectorAll('main, [role="main"]').length,
      landmarkNavCount: document.querySelectorAll('nav, [role="navigation"]').length,
      iframeMissingTitle: document.querySelectorAll('iframe:not([title])').length,
      invalidAriaRoles,
      tablesWithoutHeaders,
      listsWithInvalidStructure,
      lowContrastSamples,
      contrastSamplingAvailable: lowContrastSamples.length > 0,
    };
  }
}
