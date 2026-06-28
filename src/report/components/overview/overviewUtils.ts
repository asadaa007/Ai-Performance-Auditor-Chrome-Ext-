import type { IssueCategory } from '@features/analysis';
import type { AuditCategory } from '@features/enterprise-audit/types/audit';

export const CATEGORY_REPORT_PATHS: Record<string, string> = {
  Performance: '/performance',
  Accessibility: '/accessibility',
  SEO: '/seo',
  'Best Practices': '/best-practices',
  Security: '/security',
  Network: '/network',
  Resources: '/resources',
  Images: '/images',
  Fonts: '/fonts',
  JavaScript: '/javascript',
  CSS: '/css',
  DOM: '/dom',
  Storage: '/storage',
  performance: '/performance',
  accessibility: '/accessibility',
  seo: '/seo',
  bestPractices: '/best-practices',
  security: '/security',
};

export function categoryReportPath(category: IssueCategory | AuditCategory | string): string {
  return CATEGORY_REPORT_PATHS[category] ?? '/';
}

export function scoreBarTone(value: number): string {
  if (value >= 90) return 'from-auditor-success/90 to-auditor-success';
  if (value >= 50) return 'from-auditor-warning/90 to-auditor-warning';
  return 'from-auditor-danger/90 to-auditor-danger';
}

export function scoreTextTone(value: number): string {
  if (value >= 90) return 'text-auditor-success';
  if (value >= 50) return 'text-auditor-warning';
  return 'text-auditor-danger';
}
