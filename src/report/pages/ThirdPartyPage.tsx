import { ReportPageShell } from '@report/components/ReportPageShell';
import { Badge, Card, MetricCard, Section } from '@shared/components';
import type { AuditResult } from '@shared/types';
import { formatBytes, formatNumber } from '@shared/utils';

export function ThirdPartyPage() {
  return (
    <ReportPageShell title="Third-party" description="Third-party scripts and network requests">
      {(result) => <ThirdPartyContent result={result} />}
    </ReportPageShell>
  );
}

function ThirdPartyContent({ result }: { result: AuditResult }) {
  const thirdParty = result.thirdParty;

  return (
    <div className="space-y-6">
      <Section title="Summary">
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <MetricCard label="Requests" value={formatNumber(thirdParty.thirdPartyRequestCount)} />
          <MetricCard
            label="Transfer size"
            value={formatBytes(thirdParty.thirdPartyTransferSize)}
          />
          <MetricCard label="Domains" value={formatNumber(thirdParty.uniqueThirdPartyDomains.length)} />
          <MetricCard label="Scripts" value={formatNumber(result.javascript.thirdPartyScripts)} />
        </div>
      </Section>
      <Section title="Domains">
        <Card className="max-h-80 space-y-2 overflow-y-auto text-xs">
          {thirdParty.uniqueThirdPartyDomains.map((domain) => (
            <div key={domain} className="flex items-center justify-between gap-2">
              <span className="font-mono text-auditor-text-secondary">{domain}</span>
              <Badge tone="accent">3rd-party</Badge>
            </div>
          ))}
        </Card>
      </Section>
    </div>
  );
}
