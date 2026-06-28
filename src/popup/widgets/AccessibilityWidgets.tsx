import { Badge, Card, Section } from '@shared/components';
import type { AuditResult } from '@shared/types';
import { formatNumber } from '@shared/utils';

export function AccessibilityIssues({ result }: { result: AuditResult }) {
  const a11y = result.accessibility;

  const issues = [
    {
      title: 'Missing alt text',
      count: a11y.missingAltCount,
      items: a11y.missingAltElements,
      tone: 'warning' as const,
    },
    {
      title: 'Missing form labels',
      count: a11y.missingFormLabelsCount,
      items: a11y.missingFormLabelElements,
      tone: 'warning' as const,
    },
    {
      title: 'Missing lang attribute',
      count: a11y.hasLangAttribute ? 0 : 1,
      items: a11y.hasLangAttribute ? [] : ['html'],
      tone: 'danger' as const,
    },
  ];

  return (
    <div className="space-y-4">
      <Section title="ARIA statistics" description="Collected accessibility signals">
        <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
          {[
            ['Roles', a11y.ariaRoleCount],
            ['aria-label', a11y.ariaLabelCount],
            ['aria-labelledby', a11y.ariaLabelledByCount],
            ['aria-describedby', a11y.ariaDescribedByCount],
            ['aria-hidden', a11y.ariaHiddenCount],
            ['Headings', a11y.headingCount],
            ['Focusable', a11y.focusableElementCount],
            ['Language', a11y.langValue ?? '—'],
          ].map(([label, value]) => (
            <Card key={String(label)} padding="sm">
              <p className="text-2xs text-auditor-muted">{label}</p>
              <p className="text-lg font-semibold">{String(value)}</p>
            </Card>
          ))}
        </div>
      </Section>

      <Section title="Detected issues" description="Raw findings — no recommendations yet">
        {issues.map((issue) => (
          <Card key={issue.title} padding="sm" className="mb-2 space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium">{issue.title}</h3>
              <Badge tone={issue.count > 0 ? issue.tone : 'success'}>
                {formatNumber(issue.count)}
              </Badge>
            </div>
            {issue.items.length > 0 ? (
              <ul className="space-y-1 font-mono text-2xs text-auditor-muted-foreground">
                {issue.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            ) : (
              <p className="text-2xs text-auditor-muted">No issues detected.</p>
            )}
          </Card>
        ))}
      </Section>

      <Section title="Heading levels">
        <div className="flex flex-wrap gap-2">
          {Object.entries(a11y.headingLevels).map(([level, count]) => (
            <Badge key={level} tone="neutral">
              {level}: {count}
            </Badge>
          ))}
        </div>
      </Section>
    </div>
  );
}
