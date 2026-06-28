import {
  missingAltTextRule,
  missingFormLabelsRule,
  missingLangRule,
} from '@features/analysis/rules/accessibility/AccessibilityRules';
import { tooManyStylesheetsRule } from '@features/analysis/rules/css/CssRules';
import { largeDomDepthRule, tooManyDomNodesRule } from '@features/analysis/rules/dom/DomRules';
import {
  missingPreloadFontsRule,
  tooManyFontsRule,
} from '@features/analysis/rules/fonts/FontRules';
import {
  largeImageRule,
  missingImageDimensionsRule,
  missingLazyLoadRule,
} from '@features/analysis/rules/images/ImageRules';
import { tooManyScriptsRule } from '@features/analysis/rules/javascript/JavaScriptRules';
import {
  poorClsRule,
  poorFcpRule,
  poorInpRule,
  poorLcpRule,
  poorTtfbRule,
} from '@features/analysis/rules/performance/WebVitalsRules';
import {
  duplicateCssRule,
  duplicateJsRule,
} from '@features/analysis/rules/resources/DuplicateResourceRules';
import {
  largeTransferSizeRule,
  slowResourcesRule,
  tooManyThirdPartyRequestsRule,
} from '@features/analysis/rules/resources/NetworkRules';
import {
  missingCanonicalRule,
  missingMetaDescriptionRule,
  missingTitleRule,
} from '@features/analysis/rules/seo/SeoRules';
import {
  largeStorageUsageRule,
  tooManyCookiesRule,
} from '@features/analysis/rules/storage/StorageRules';
import type { AnalysisRule } from '@features/analysis/types';

export const ANALYSIS_RULES: AnalysisRule[] = [
  poorLcpRule,
  poorClsRule,
  poorInpRule,
  poorFcpRule,
  poorTtfbRule,
  largeTransferSizeRule,
  slowResourcesRule,
  tooManyThirdPartyRequestsRule,
  duplicateJsRule,
  duplicateCssRule,
  largeImageRule,
  missingLazyLoadRule,
  missingImageDimensionsRule,
  tooManyStylesheetsRule,
  tooManyScriptsRule,
  tooManyDomNodesRule,
  largeDomDepthRule,
  missingLangRule,
  missingAltTextRule,
  missingFormLabelsRule,
  missingTitleRule,
  missingMetaDescriptionRule,
  missingCanonicalRule,
  largeStorageUsageRule,
  tooManyCookiesRule,
  tooManyFontsRule,
  missingPreloadFontsRule,
];

export class IssueRegistry {
  private readonly rules: AnalysisRule[];

  constructor(rules: AnalysisRule[] = ANALYSIS_RULES) {
    this.rules = rules;
  }

  getRules(): AnalysisRule[] {
    return [...this.rules];
  }

  getRuleCount(): number {
    return this.rules.length;
  }
}
