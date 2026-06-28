import { WebVitalsGrid } from '@popup/widgets/DashboardWidgets';
import { ReportPageShell } from '@report/components/ReportPageShell';
import { MetricCard, Section } from '@shared/components';
import type { AuditResult } from '@shared/types';
import { formatMs, formatNumber } from '@shared/utils';

function PerformanceContent({ result }: { result: AuditResult }) {
  return (
    <div className="space-y-6">
      <WebVitalsGrid result={result} />
      <Section title="Navigation timing" description="Navigation Timing API breakdown">
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
          {[
            ['DNS lookup', result.navigationTiming.dnsLookup.value],
            ['TCP connection', result.navigationTiming.tcpConnection.value],
            ['TLS negotiation', result.navigationTiming.tlsNegotiation.value],
            ['Redirect', result.navigationTiming.redirectTime.value],
            ['Response start', result.navigationTiming.responseStart.value],
            ['Response end', result.navigationTiming.responseEnd.value],
            ['DOM interactive', result.navigationTiming.domInteractive.value],
            ['DOM complete', result.navigationTiming.domComplete.value],
            ['Load event', result.navigationTiming.loadEvent.value],
          ].map(([label, value]) => (
            <MetricCard
              key={String(label)}
              label={String(label)}
              value={formatMs(value as number | null)}
              unit="ms"
            />
          ))}
        </div>
      </Section>
      <Section title="Transfer sizes">
        <div className="grid grid-cols-3 gap-3">
          <MetricCard
            label="Transfer"
            value={formatNumber(result.navigationTiming.transferSize)}
            unit="B"
          />
          <MetricCard
            label="Encoded"
            value={formatNumber(result.navigationTiming.encodedBodySize)}
            unit="B"
          />
          <MetricCard
            label="Decoded"
            value={formatNumber(result.navigationTiming.decodedBodySize)}
            unit="B"
          />
        </div>
      </Section>
    </div>
  );
}

export function PerformancePage() {
  return (
    <ReportPageShell title="Performance" description="Navigation timing and Web Vitals">
      {(result) => <PerformanceContent result={result} />}
    </ReportPageShell>
  );
}
