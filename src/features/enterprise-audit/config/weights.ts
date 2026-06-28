import type { AuditCategory } from '@features/enterprise-audit/types/audit';

export const ENTERPRISE_CATEGORY_WEIGHTS: Record<AuditCategory, number> = {
  performance: 0.35,
  accessibility: 0.2,
  seo: 0.15,
  'best-practices': 0.15,
  security: 0.1,
  network: 0.05,
};

export const ENTERPRISE_CATEGORY_LABELS: Record<AuditCategory, string> = {
  performance: 'Performance',
  accessibility: 'Accessibility',
  seo: 'SEO',
  'best-practices': 'Best Practices',
  security: 'Security',
  network: 'Network',
};
