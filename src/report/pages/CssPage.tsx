import { AccordionItem, Badge, Card, MetricCard, Section } from '@shared/components';
import { ReportPageShell } from '@report/components/ReportPageShell';
import type { AuditResult } from '@shared/types';
import { formatBytes, formatNumber, formatUrl } from '@shared/utils';

export function CssPage() {
  return (
    <ReportPageShell title="CSS" description="Stylesheets, rules, and CSS variables">
      {(result) => <CssContent result={result} />}
    </ReportPageShell>
  );
}

function CssContent({ result }: { result: AuditResult }) {
  return (
    <div className="space-y-6">
      <Section title="Summary">
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <MetricCard label="Stylesheets" value={formatNumber(result.css.totalStylesheets)} />
          <MetricCard label="Inline blocks" value={formatNumber(result.css.inlineStyleBlocks)} />
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
  );
}

export function JavaScriptPage() {
  return (
    <ReportPageShell title="JavaScript" description="Script inventory and loading attributes">
      {(result) => <JavaScriptContent result={result} />}
    </ReportPageShell>
  );
}

function JavaScriptContent({ result }: { result: AuditResult }) {
  return (
    <div className="space-y-6">
      <Section title="Summary">
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <MetricCard label="Total" value={formatNumber(result.javascript.totalScripts)} />
          <MetricCard label="Inline" value={formatNumber(result.javascript.inlineScripts)} />
          <MetricCard label="External" value={formatNumber(result.javascript.externalScripts)} />
          <MetricCard label="Modules" value={formatNumber(result.javascript.moduleScripts)} />
          <MetricCard label="Async" value={formatNumber(result.javascript.asyncScripts)} />
          <MetricCard label="Defer" value={formatNumber(result.javascript.deferScripts)} />
          <MetricCard label="Third-party" value={formatNumber(result.javascript.thirdPartyScripts)} />
        </div>
      </Section>
      <Section title="Scripts">
        <Card padding="sm" className="max-h-80 overflow-y-auto p-0">
          {result.javascript.scripts.map((script, index) => (
            <AccordionItem
              key={`${script.src ?? 'inline'}-${index}`}
              title={script.src ? formatUrl(script.src, 64) : 'Inline script'}
              subtitle={script.type}
              badge={
                <div className="flex gap-1">
                  {script.isModule && <Badge>module</Badge>}
                  {script.async && <Badge>async</Badge>}
                  {script.defer && <Badge>defer</Badge>}
                  {script.isThirdParty && <Badge>3rd-party</Badge>}
                </div>
              }
            >
              <p className="text-2xs text-auditor-muted">
                Size: {script.byteSize !== null ? formatBytes(script.byteSize) : '—'}
              </p>
            </AccordionItem>
          ))}
        </Card>
      </Section>
    </div>
  );
}
