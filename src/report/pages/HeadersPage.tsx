import { ReportPageShell } from '@report/components/ReportPageShell';
import { Badge, Card, Section } from '@shared/components';
import type { AuditResult } from '@shared/types';

const HEADER_LABELS: Record<string, string> = {
  strictTransportSecurity: 'Strict-Transport-Security',
  xFrameOptions: 'X-Frame-Options',
  xContentTypeOptions: 'X-Content-Type-Options',
  referrerPolicy: 'Referrer-Policy',
  contentSecurityPolicy: 'Content-Security-Policy',
  crossOriginOpenerPolicy: 'Cross-Origin-Opener-Policy',
  crossOriginEmbedderPolicy: 'Cross-Origin-Embedder-Policy',
  crossOriginResourcePolicy: 'Cross-Origin-Resource-Policy',
  permissionsPolicy: 'Permissions-Policy',
};

export function HeadersPage() {
  return (
    <ReportPageShell title="Headers" description="Security and policy response headers">
      {(result) => <HeadersContent result={result} />}
    </ReportPageShell>
  );
}

function HeadersContent({ result }: { result: AuditResult }) {
  const security = result.security;

  return (
    <div className="space-y-6">
      <Section title="Response headers" description="Best-effort header presence from the page response">
        <Card className="divide-y divide-auditor-border-subtle p-0 text-xs">
          {Object.entries(security.responseHeaders).map(([key, value]) => (
            <div key={key} className="flex items-center justify-between gap-3 px-3 py-2.5">
              <span className="font-mono text-auditor-text-secondary">
                {HEADER_LABELS[key] ?? key}
              </span>
              <Badge
                tone={value === 'present' ? 'success' : value === 'absent' ? 'warning' : 'neutral'}
              >
                {value}
              </Badge>
            </div>
          ))}
        </Card>
      </Section>
      {!security.headerFetchSucceeded && security.headerFetchError && (
        <p className="text-xs text-auditor-warning">{security.headerFetchError}</p>
      )}
    </div>
  );
}
