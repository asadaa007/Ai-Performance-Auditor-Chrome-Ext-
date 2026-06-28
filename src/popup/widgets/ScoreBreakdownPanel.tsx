import { scoreTone } from '@features/scoring';
import type { ScoreResult } from '@features/scoring';
import { AccordionItem, Badge, Card, Section } from '@shared/components';

interface ScoreBreakdownPanelProps {
  score: ScoreResult | null;
}

export function ScoreBreakdownPanel({ score }: ScoreBreakdownPanelProps) {
  if (!score) {
    return null;
  }

  return (
    <Section title="Score breakdown" description="Why each category scored the way it did">
      <Card padding="sm" className="divide-y divide-auditor-border-subtle p-0">
        {score.categories.map((category) => (
          <AccordionItem
            key={category.category}
            title={`${category.label}: ${category.score}`}
            subtitle={`${category.negativeFindings.length} issues · ${category.positiveFindings.length} passed`}
            badge={<Badge tone={scoreTone(category.score)}>{category.score}</Badge>}
          >
            <div className="space-y-3 px-3 pb-3 text-xs">
              <div>
                <p className="mb-1 font-medium text-auditor-text-secondary">Why this score?</p>
                <p className="text-auditor-muted">
                  Started at 100 and subtracted weighted penalties for triggered rules in this
                  category.
                </p>
              </div>

              {category.negativeFindings.length > 0 && (
                <div>
                  <p className="mb-1 font-medium text-auditor-danger">Negative findings</p>
                  <ul className="space-y-1 text-2xs text-auditor-muted">
                    {category.negativeFindings.map((finding) => (
                      <li key={finding.ruleId}>
                        −{finding.penalty} {finding.title}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {category.positiveFindings.length > 0 && (
                <div>
                  <p className="mb-1 font-medium text-auditor-success">Positive findings</p>
                  <ul className="space-y-1 text-2xs text-auditor-muted">
                    {category.positiveFindings.slice(0, 8).map((finding) => (
                      <li key={finding.ruleId}>✓ {finding.title}</li>
                    ))}
                    {category.positiveFindings.length > 8 && (
                      <li>+{category.positiveFindings.length - 8} more passed checks</li>
                    )}
                  </ul>
                </div>
              )}

              <div className="rounded-lg border border-auditor-border-subtle bg-auditor-bg-elevated p-2 font-mono text-2xs text-auditor-muted">
                Score calculation: {category.calculation}
              </div>
            </div>
          </AccordionItem>
        ))}
      </Card>
    </Section>
  );
}
