import type { ScoreResult } from '@features/scoring';
import { MetricCard, Section } from '@shared/components';

interface IssuesSummaryPanelProps {
  score: ScoreResult | null;
}

export function IssuesSummaryPanel({ score }: IssuesSummaryPanelProps) {
  if (!score) {
    return null;
  }

  return (
    <Section title="Issue summary" description="Severity breakdown from rule analysis">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <MetricCard
          label="Critical issues"
          value={String(score.criticalCount)}
          description="High and critical severity"
        />
        <MetricCard
          label="Warnings"
          value={String(score.warningCount)}
          description="Medium severity findings"
        />
        <MetricCard
          label="Passed checks"
          value={String(score.passedCount)}
          description="Rules evaluated without issues"
        />
        <MetricCard
          label="Improvement potential"
          value={String(score.estimatedImprovementPotential)}
          unit="pts"
          description="Recoverable score from penalties"
        />
      </div>
    </Section>
  );
}
