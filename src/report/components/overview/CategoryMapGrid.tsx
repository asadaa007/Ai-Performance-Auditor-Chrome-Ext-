import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import type { AnalysisResult } from '@features/analysis';
import type { EnterpriseScoreResult } from '@features/enterprise-audit';
import { Card, StatusPill } from '@shared/components';
import { NavIcon, type NavIconName } from '@shared/components/NavIcon';
import { DashboardSection } from '@report/components/overview/DashboardSection';
import {
  categoryReportPath,
  scoreBarTone,
  scoreTextTone,
} from '@report/components/overview/overviewUtils';

const CATEGORY_ICONS: Record<string, NavIconName> = {
  Performance: 'chart',
  Accessibility: 'accessibility',
  SEO: 'globe',
  'Best Practices': 'checked',
  Security: 'shield',
  performance: 'chart',
  accessibility: 'accessibility',
  seo: 'globe',
  bestPractices: 'checked',
  security: 'shield',
};

interface CategoryMapGridProps {
  enterpriseScore: EnterpriseScoreResult | null;
  analysis: AnalysisResult | null;
}

export function CategoryMapGrid({ enterpriseScore, analysis }: CategoryMapGridProps) {
  const categories = enterpriseScore?.categories ?? [];

  if (categories.length === 0) {
    return null;
  }

  return (
    <DashboardSection
      icon="dashboard"
      title="Category health map"
      subtitle="Jump into any audit category — scores reflect enterprise rule weighting"
    >
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-5">
        {categories.map((category, index) => {
          const path = categoryReportPath(category.category);
          const icon = CATEGORY_ICONS[category.category] ?? 'chart';
          const issueCount =
            analysis?.byCategory?.[category.label as keyof NonNullable<AnalysisResult['byCategory']>] ??
            analysis?.issues.filter((i) => i.category === category.label).length ??
            0;
          const failedCount = category.failedAudits.length;

          return (
            <motion.div
              key={category.category}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.04 }}
            >
              <Link to={path} className="block h-full">
                <Card
                  variant="elevated"
                  className="group h-full transition-all hover:border-auditor-accent/40 hover:shadow-glow-sm"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-auditor-accent-muted">
                      <NavIcon name={icon} size={16} className="text-auditor-accent" />
                    </div>
                    <span
                      className={`font-mono text-lg font-bold tabular-nums ${scoreTextTone(category.score)}`}
                    >
                      {category.score}
                    </span>
                  </div>
                  <p className="mt-3 text-sm font-medium text-auditor-text group-hover:text-auditor-accent">
                    {category.label}
                  </p>
                  <div className="mt-3 score-bar-track">
                    <div
                      className={`score-bar-fill bg-gradient-to-r ${scoreBarTone(category.score)}`}
                      style={{ width: `${category.score}%` }}
                    />
                  </div>
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {failedCount > 0 && (
                      <StatusPill label={`${failedCount} failed audits`} tone="danger" />
                    )}
                    {issueCount > 0 && (
                      <StatusPill label={`${issueCount} issues`} tone="warning" />
                    )}
                    {failedCount === 0 && issueCount === 0 && (
                      <StatusPill label="Clean" tone="success" />
                    )}
                  </div>
                  <p className="mt-2 text-3xs text-auditor-muted">
                    Weight {Math.round(category.weight * 100)}% · Coverage{' '}
                    {Math.round(category.coveragePercent)}%
                  </p>
                </Card>
              </Link>
            </motion.div>
          );
        })}
      </div>
    </DashboardSection>
  );
}
