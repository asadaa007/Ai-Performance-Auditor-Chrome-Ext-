import { PageShell } from '@popup/components/PageShell';
import { AccordionItem, Badge, Card, MetricCard, Section } from '@shared/components';
import { formatNumber } from '@shared/utils';

export function CssPage() {
  return (
    <PageShell title="CSS" description="Stylesheets, rules, and CSS variables">
      {(result) => (
        <div className="space-y-6">
          <Section title="Summary">
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
              <MetricCard label="Stylesheets" value={formatNumber(result.css.totalStylesheets)} />
              <MetricCard
                label="Inline blocks"
                value={formatNumber(result.css.inlineStyleBlocks)}
              />
              <MetricCard label="External" value={formatNumber(result.css.externalStylesheets)} />
              <MetricCard label="CSS variables" value={formatNumber(result.css.cssVariableCount)} />
              <MetricCard
                label="Inline attributes"
                value={formatNumber(result.css.inlineStyleAttributeCount)}
              />
              <MetricCard label="Total rules" value={formatNumber(result.css.totalRuleCount)} />
            </div>
          </Section>
          <Section title="Stylesheets">
            <Card padding="sm" className="max-h-72 overflow-y-auto p-0">
              {result.css.stylesheets.map((sheet, index) => (
                <AccordionItem
                  key={`${sheet.href ?? 'inline'}-${index}`}
                  title={sheet.href ?? 'Inline stylesheet'}
                  subtitle={`${sheet.type} · ${sheet.ruleCount ?? '—'} rules`}
                  badge={
                    <Badge tone={sheet.accessible ? 'success' : 'warning'}>
                      {sheet.accessible ? 'Readable' : 'Cross-origin'}
                    </Badge>
                  }
                >
                  <p className="text-2xs text-auditor-muted">
                    Unused rule estimation requires DevTools coverage API.
                  </p>
                </AccordionItem>
              ))}
            </Card>
          </Section>
        </div>
      )}
    </PageShell>
  );
}
