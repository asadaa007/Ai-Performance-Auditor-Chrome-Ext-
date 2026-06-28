import { PageShell } from '@popup/components/PageShell';
import { AccordionItem, Badge, Card, MetricCard, Section } from '@shared/components';
import { formatBytes, formatNumber, formatUrl } from '@shared/utils';

export function JavaScriptPage() {
  return (
    <PageShell title="JavaScript" description="Script inventory and loading attributes">
      {(result) => (
        <div className="space-y-6">
          <Section title="Summary">
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
              <MetricCard label="Total" value={formatNumber(result.javascript.totalScripts)} />
              <MetricCard label="Inline" value={formatNumber(result.javascript.inlineScripts)} />
              <MetricCard
                label="External"
                value={formatNumber(result.javascript.externalScripts)}
              />
              <MetricCard label="Modules" value={formatNumber(result.javascript.moduleScripts)} />
              <MetricCard label="Async" value={formatNumber(result.javascript.asyncScripts)} />
              <MetricCard label="Defer" value={formatNumber(result.javascript.deferScripts)} />
              <MetricCard
                label="Third-party"
                value={formatNumber(result.javascript.thirdPartyScripts)}
              />
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
      )}
    </PageShell>
  );
}
