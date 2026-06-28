import type { EnterpriseScoreResult } from '@features/enterprise-audit';
import { scoreTone } from '@features/scoring';
import type { ScoreResult } from '@features/scoring';
import { Card, ScoreRing, Section, StatusPill } from '@shared/components';

interface WebsiteHealthPanelProps {
  enterpriseScore: EnterpriseScoreResult | null;
  score: ScoreResult | null;
}

function categoryTone(value: number): 'success' | 'warning' | 'danger' {
  if (value >= 90) return 'success';
  if (value >= 50) return 'warning';
  return 'danger';
}

export function WebsiteHealthPanel({ enterpriseScore, score }: WebsiteHealthPanelProps) {
  if (enterpriseScore) {
    return (
      <Section
        title="Website health"
        description="Weighted category scores from enterprise audit rules — the single source of truth for Performance, Accessibility, SEO, Best Practices, and Security"
      >
        <Card className="overflow-hidden p-0">
          <div className="grid lg:grid-cols-[minmax(200px,240px)_1fr]">
            <div className="flex flex-col items-center justify-center gap-3 border-b border-auditor-border-subtle bg-auditor-bg-elevated/40 px-6 py-8 lg:border-b-0 lg:border-r">
              <ScoreRing
                value={enterpriseScore.overallScore}
                max={100}
                label="Overall score"
                tone={categoryTone(enterpriseScore.overallScore)}
                size="lg"
              />
              <div className="space-y-2 text-center">
                <p className="text-2xl font-bold tracking-tight text-auditor-text">
                  {enterpriseScore.grade}
                </p>
                <StatusPill
                  label={`Max achievable ${enterpriseScore.maxAchievableScore}`}
                  tone="neutral"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-x-4 gap-y-6 p-6 sm:grid-cols-3 lg:grid-cols-5 lg:gap-4">
              {enterpriseScore.categories.map((category) => (
                <div key={category.category} className="flex flex-col items-center gap-1.5">
                  <ScoreRing
                    value={category.score}
                    max={100}
                    label={category.label}
                    tone={categoryTone(category.score)}
                    size="sm"
                  />
                  <p className="text-3xs text-auditor-muted">
                    Weight {Math.round(category.weight * 100)}%
                  </p>
                </div>
              ))}
            </div>
          </div>

          {enterpriseScore.scoreExplanation && (
            <p className="border-t border-auditor-border-subtle px-6 py-3 text-2xs leading-relaxed text-auditor-muted">
              {enterpriseScore.scoreExplanation}
            </p>
          )}
        </Card>
      </Section>
    );
  }

  if (!score) {
    return null;
  }

  const { overall } = score;

  return (
    <Section
      title="Website health"
      description="Weighted scores from performance issue analysis (enterprise audit unavailable)"
    >
      <Card className="overflow-hidden p-0">
        <div className="grid lg:grid-cols-[minmax(200px,240px)_1fr]">
          <div className="flex flex-col items-center justify-center gap-3 border-b border-auditor-border-subtle bg-auditor-bg-elevated/40 px-6 py-8 lg:border-b-0 lg:border-r">
            <ScoreRing
              value={overall.score}
              max={100}
              label="Overall score"
              tone={scoreTone(overall.score)}
              size="lg"
            />
            <div className="space-y-2 text-center">
              <p className="text-2xl font-bold tracking-tight text-auditor-text">{overall.grade}</p>
              <StatusPill label={overall.label} tone={scoreTone(overall.score)} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-x-4 gap-y-6 p-6 sm:grid-cols-3 lg:grid-cols-5 lg:gap-4">
            {overall.weightedCategories.map((category) => (
              <div key={category.category} className="flex flex-col items-center gap-1.5">
                <ScoreRing
                  value={category.score}
                  max={100}
                  label={category.label}
                  tone={scoreTone(category.score)}
                  size="sm"
                />
                <p className="text-3xs text-auditor-muted">
                  Weight {Math.round(category.weight * 100)}%
                </p>
              </div>
            ))}
          </div>
        </div>
      </Card>
    </Section>
  );
}
