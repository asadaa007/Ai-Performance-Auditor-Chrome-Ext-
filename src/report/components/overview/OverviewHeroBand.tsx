import { motion } from 'framer-motion';
import type { EnterpriseScoreResult } from '@features/enterprise-audit';
import type { ScoreResult } from '@features/scoring';
import type { AnalysisResult } from '@features/analysis';
import type { EnterpriseAuditReport } from '@features/enterprise-audit';
import { StatusPill } from '@shared/components';
import { NavIcon } from '@shared/components/NavIcon';
import { formatTimestamp } from '@shared/utils';
import { scoreTextTone } from '@report/components/overview/overviewUtils';

interface OverviewHeroBandProps {
  url: string;
  collectedAt: number;
  enterpriseScore: EnterpriseScoreResult | null;
  score: ScoreResult | null;
  analysis: AnalysisResult | null;
  enterpriseReport: EnterpriseAuditReport | null;
}

export function OverviewHeroBand({
  url,
  collectedAt,
  enterpriseScore,
  score,
  analysis,
  enterpriseReport,
}: OverviewHeroBandProps) {
  const displayScore = enterpriseScore?.overallScore ?? score?.overall.score ?? null;
  const grade = enterpriseScore?.grade ?? score?.overall.grade ?? '—';
  const toneClass = displayScore === null ? 'text-auditor-muted' : scoreTextTone(displayScore);
  const issueCount = analysis?.issueCount ?? 0;
  const coverage = enterpriseReport?.summary.coveragePercent ?? enterpriseScore?.coveragePercent;

  return (
    <section className="hero-panel overflow-hidden">
      <div className="relative grid gap-0 lg:grid-cols-12">
        <div className="space-y-4 border-b border-auditor-border-subtle p-6 lg:col-span-7 lg:border-b-0 lg:border-r lg:p-8">
          <div className="flex flex-wrap gap-2">
            <StatusPill label="Snapshot report" tone="accent" />
            <StatusPill label={`Captured ${formatTimestamp(collectedAt)}`} tone="neutral" />
            {analysis && (
              <StatusPill label={`${issueCount} findings`} tone={issueCount > 0 ? 'warning' : 'success'} />
            )}
          </div>
          <div>
            <p className="text-3xs font-semibold uppercase tracking-[0.2em] text-auditor-muted">
              Audited URL
            </p>
            <p className="mt-2 break-all font-mono text-sm leading-relaxed text-auditor-text">
              {url}
            </p>
          </div>
          {(enterpriseScore?.scoreExplanation || score?.overall.label) && (
            <p className="text-sm leading-relaxed text-auditor-text-secondary">
              {enterpriseScore?.scoreExplanation ?? `Health: ${score?.overall.label}`}
            </p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-px bg-auditor-border-subtle lg:col-span-5">
          <motion.div
            className="flex flex-col items-center justify-center bg-auditor-bg/40 p-6 lg:col-span-2 lg:row-span-1"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <NavIcon name="chart" size={24} className="mb-2 text-auditor-accent" />
            <p className={`text-5xl font-bold tabular-nums tracking-tight ${toneClass}`}>
              {displayScore ?? '—'}
            </p>
            <p className="mt-1 text-2xs uppercase tracking-wider text-auditor-muted">Overall score</p>
            <p className="mt-2 text-lg font-semibold text-auditor-text">{grade}</p>
          </motion.div>

          <div className="flex flex-col items-center justify-center bg-auditor-surface/60 p-4 text-center">
            <p className="text-2xs text-auditor-muted">Max achievable</p>
            <p className="mt-1 text-xl font-semibold tabular-nums text-auditor-text">
              {enterpriseScore?.maxAchievableScore ?? '—'}
            </p>
          </div>

          <div className="flex flex-col items-center justify-center bg-auditor-surface/60 p-4 text-center">
            <p className="text-2xs text-auditor-muted">Audit coverage</p>
            <p className="mt-1 text-xl font-semibold tabular-nums text-auditor-text">
              {coverage !== undefined ? `${coverage}%` : '—'}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
