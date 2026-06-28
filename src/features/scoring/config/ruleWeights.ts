import type { ScoreCategory } from '@features/scoring/types/score';

export const CATEGORY_LABELS: Record<ScoreCategory, string> = {
  performance: 'Performance',
  accessibility: 'Accessibility',
  seo: 'SEO',
  bestPractices: 'Best Practices',
  security: 'Security',
};

export const CATEGORY_WEIGHTS: Record<ScoreCategory, number> = {
  performance: 0.4,
  accessibility: 0.2,
  seo: 0.15,
  bestPractices: 0.15,
  security: 0.1,
};

export interface RuleWeightConfig {
  category: ScoreCategory;
  penalty: number;
  title: string;
}

export const RULE_SCORE_WEIGHTS: Record<string, RuleWeightConfig> = {
  'poor-lcp': { category: 'performance', penalty: 15, title: 'Poor LCP' },
  'poor-cls': { category: 'performance', penalty: 12, title: 'Poor CLS' },
  'poor-inp': { category: 'performance', penalty: 12, title: 'Poor INP' },
  'poor-fcp': { category: 'performance', penalty: 10, title: 'Poor FCP' },
  'poor-ttfb': { category: 'performance', penalty: 8, title: 'Poor TTFB' },
  'large-transfer-size': { category: 'performance', penalty: 8, title: 'Large transfer size' },
  'slow-resources': { category: 'performance', penalty: 6, title: 'Slow resources' },
  'duplicate-js': { category: 'performance', penalty: 4, title: 'Duplicate JavaScript' },
  'duplicate-css': { category: 'performance', penalty: 4, title: 'Duplicate CSS' },
  'large-images': { category: 'performance', penalty: 8, title: 'Large images' },
  'missing-lazy-load': { category: 'performance', penalty: 5, title: 'Missing lazy loading' },
  'missing-image-dimensions': {
    category: 'performance',
    penalty: 4,
    title: 'Missing image dimensions',
  },
  'too-many-stylesheets': { category: 'performance', penalty: 4, title: 'Too many stylesheets' },
  'too-many-scripts': { category: 'performance', penalty: 5, title: 'Too many scripts' },
  'too-many-dom-nodes': { category: 'performance', penalty: 5, title: 'Too many DOM nodes' },
  'large-dom-depth': { category: 'performance', penalty: 4, title: 'Large DOM depth' },
  'too-many-fonts': { category: 'performance', penalty: 3, title: 'Too many fonts' },
  'missing-preload-fonts': { category: 'performance', penalty: 3, title: 'Missing font preload' },
  'missing-lang': { category: 'accessibility', penalty: 8, title: 'Missing lang attribute' },
  'missing-alt-text': { category: 'accessibility', penalty: 10, title: 'Missing alt text' },
  'missing-form-labels': { category: 'accessibility', penalty: 8, title: 'Missing form labels' },
  'missing-title': { category: 'seo', penalty: 10, title: 'Missing title' },
  'missing-meta-description': { category: 'seo', penalty: 6, title: 'Missing meta description' },
  'missing-canonical': { category: 'seo', penalty: 5, title: 'Missing canonical URL' },
  'too-many-third-party-requests': {
    category: 'bestPractices',
    penalty: 6,
    title: 'Too many third-party requests',
  },
  'large-storage-usage': { category: 'bestPractices', penalty: 4, title: 'Large storage usage' },
  'too-many-cookies': { category: 'security', penalty: 6, title: 'Too many cookies' },
};

export const SCORE_CATEGORY_RULES: Record<ScoreCategory, string[]> = Object.entries(
  RULE_SCORE_WEIGHTS,
).reduce<Record<ScoreCategory, string[]>>(
  (acc, [ruleId, config]) => {
    acc[config.category].push(ruleId);
    return acc;
  },
  {
    performance: [],
    accessibility: [],
    seo: [],
    bestPractices: [],
    security: [],
  },
);
