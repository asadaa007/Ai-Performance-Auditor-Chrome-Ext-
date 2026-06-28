import { motion } from 'framer-motion';
import type { EnterpriseScoreResult } from '@features/enterprise-audit';
import type { ScoreResult } from '@features/scoring';
import { StatusPill } from '@shared/components';
import { NavIcon } from '@shared/components/NavIcon';
import { formatTimestamp } from '@shared/utils';

interface OverviewHeroProps {
  url: string;
  collectedAt: number;
  enterpriseScore: EnterpriseScoreResult | null;
  score: ScoreResult | null;
}

function scoreTone(value: number): 'success' | 'warning' | 'danger' {
  if (value >= 90) return 'success';
  if (value >= 50) return 'warning';
  return 'danger';
}

const toneText: Record<'success' | 'warning' | 'danger', string> = {
  success: 'text-auditor-success',
  warning: 'text-auditor-warning',
  danger: 'text-auditor-danger',
};

export function OverviewHero({ url, collectedAt, enterpriseScore, score }: OverviewHeroProps) {
  const displayScore = enterpriseScore?.overallScore ?? score?.overall.score ?? null;
  const grade = enterpriseScore?.grade ?? score?.overall.grade ?? '—';
  const tone = displayScore === null ? 'warning' : scoreTone(displayScore);

  return (
    <section className="hero-panel p-8">
      <div className="relative grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center">
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <StatusPill label="Audit complete" tone="success" />
            <StatusPill label={`Captured ${formatTimestamp(collectedAt)}`} tone="neutral" />
          </div>
          <div>
            <p className="text-2xs font-medium uppercase tracking-widest text-auditor-muted">
              Website health
            </p>
            <h2 className="mt-2 truncate font-mono text-sm text-auditor-text-secondary">{url}</h2>
          </div>
          {enterpriseScore?.scoreExplanation && (
            <p className="max-w-2xl text-sm leading-relaxed text-auditor-muted-foreground">
              {enterpriseScore.scoreExplanation}
            </p>
          )}
        </div>

        <motion.div
          className="flex flex-col items-center gap-3 rounded-2xl border border-auditor-border-subtle bg-auditor-bg/50 px-10 py-8 backdrop-blur-sm"
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
        >
          <NavIcon name="chart" size={28} className="text-auditor-accent" />
          <p className={`text-display font-bold tabular-nums ${toneText[tone]}`}>
            {displayScore ?? '—'}
          </p>
          <p className="text-2xs uppercase tracking-wider text-auditor-muted">Overall score</p>
          <p className="text-lg font-semibold text-auditor-text">{grade}</p>
          {enterpriseScore && (
            <p className="text-2xs text-auditor-muted">
              Max achievable {enterpriseScore.maxAchievableScore}
            </p>
          )}
        </motion.div>
      </div>
    </section>
  );
}
