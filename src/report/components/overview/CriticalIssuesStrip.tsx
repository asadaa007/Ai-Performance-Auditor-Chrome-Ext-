import { Link } from 'react-router-dom';
import type { PerformanceIssue } from '@features/analysis';
import { motion } from 'framer-motion';
import { Card, StatusPill } from '@shared/components';
import { NavIcon } from '@shared/components/NavIcon';

interface CriticalIssuesStripProps {
  issues: PerformanceIssue[];
}

const severityPath: Partial<Record<PerformanceIssue['category'], string>> = {
  Performance: '/performance',
  Accessibility: '/accessibility',
  SEO: '/seo',
  Security: '/security',
  JavaScript: '/javascript',
  CSS: '/css',
  Images: '/images',
};

export function CriticalIssuesStrip({ issues }: CriticalIssuesStripProps) {
  const critical = issues
    .filter((issue) => issue.severity === 'Critical' || issue.severity === 'High')
    .slice(0, 6);

  if (critical.length === 0) {
    return (
      <Card variant="glass" className="flex items-center gap-3">
        <NavIcon name="checked" size={22} className="text-auditor-success" />
        <div>
          <p className="text-sm font-medium text-auditor-text">No critical issues detected</p>
          <p className="text-2xs text-auditor-muted">Review category sections for medium and low findings.</p>
        </div>
      </Card>
    );
  }

  return (
    <section className="space-y-3">
      <div className="flex items-center gap-2">
        <NavIcon name="alert" size={18} className="text-auditor-danger" />
        <h3 className="text-sm font-semibold text-auditor-text">Critical problems</h3>
        <span className="text-2xs text-auditor-muted">{critical.length} need attention</span>
      </div>
      <div className="flex gap-3 overflow-x-auto pb-1">
        {critical.map((issue, index) => {
          const path = severityPath[issue.category] ?? '/';
          return (
            <motion.div
              key={issue.id}
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.04 }}
              className="min-w-[240px] max-w-[280px] shrink-0"
            >
              <Link to={path} className="block h-full">
                <Card
                  padding="sm"
                  className="h-full border-l-2 border-l-auditor-danger transition-shadow hover:shadow-glow-sm"
                >
                  <div className="flex items-start justify-between gap-2">
                    <StatusPill
                      label={issue.severity}
                      tone={issue.severity === 'Critical' ? 'danger' : 'warning'}
                    />
                    <span className="text-3xs text-auditor-muted">{issue.category}</span>
                  </div>
                  <p className="mt-2 line-clamp-2 text-xs font-medium text-auditor-text">
                    {issue.title}
                  </p>
                  <p className="mt-1 line-clamp-2 text-2xs text-auditor-muted">{issue.description}</p>
                </Card>
              </Link>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
