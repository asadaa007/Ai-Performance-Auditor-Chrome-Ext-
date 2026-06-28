import type { EnterpriseScoreResult } from '@features/enterprise-audit';
import { motion } from 'framer-motion';

interface CategoryScoreBarsProps {
  enterpriseScore: EnterpriseScoreResult;
}

function barTone(value: number): string {
  if (value >= 90) return 'from-auditor-success/80 to-auditor-success';
  if (value >= 50) return 'from-auditor-warning/80 to-auditor-warning';
  return 'from-auditor-danger/80 to-auditor-danger';
}

export function CategoryScoreBars({ enterpriseScore }: CategoryScoreBarsProps) {
  return (
    <section className="space-y-4">
      <div>
        <h3 className="text-sm font-semibold text-auditor-text">Category scores</h3>
        <p className="text-2xs text-auditor-muted">Weighted enterprise audit categories</p>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {enterpriseScore.categories.map((category, index) => (
          <motion.div
            key={category.category}
            className="metric-tile"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <div className="mb-2 flex items-center justify-between gap-2">
              <span className="text-xs font-medium text-auditor-text">{category.label}</span>
              <span className="font-mono text-sm font-semibold tabular-nums text-auditor-text">
                {category.score}
              </span>
            </div>
            <div className="score-bar-track">
              <div
                className={`score-bar-fill bg-gradient-to-r ${barTone(category.score)}`}
                style={{ width: `${Math.min(100, category.score)}%` }}
                role="progressbar"
                aria-valuenow={category.score}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label={`${category.label} score`}
              />
            </div>
            <p className="mt-2 text-3xs text-auditor-muted">
              Weight {Math.round(category.weight * 100)}%
            </p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
