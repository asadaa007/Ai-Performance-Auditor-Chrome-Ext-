export interface AccessibilityResult {
  missingAltCount: number;
  missingAltElements: string[];
  missingFormLabelsCount: number;
  missingFormLabelElements: string[];
  hasLangAttribute: boolean;
  langValue: string | null;
  ariaRoleCount: number;
  ariaLabelCount: number;
  ariaLabelledByCount: number;
  ariaDescribedByCount: number;
  ariaHiddenCount: number;
  headingCount: number;
  headingLevels: Record<string, number>;
  focusableElementCount: number;
  headingOrderViolations: number;
  duplicateIds: string[];
  buttonsWithoutName: string[];
  linksWithoutName: string[];
  positiveTabIndexCount: number;
  landmarkMainCount: number;
  landmarkNavCount: number;
  iframeMissingTitle: number;
  invalidAriaRoles: string[];
  tablesWithoutHeaders: number;
  listsWithInvalidStructure: number;
  lowContrastSamples: Array<{ selector: string; ratio: number | null }>;
  contrastSamplingAvailable: boolean;
}
