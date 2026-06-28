import type { EnterpriseAuditReport, EnterpriseScoreResult } from '@features/enterprise-audit';
import { AUDIT_INVENTORY_STATS } from '@features/enterprise-audit';
import { AccordionItem, Badge, Card, MetricCard, Section } from '@shared/components';

export function EnterpriseAuditCoveragePanel({
  report,
  score,
}: {
  report: EnterpriseAuditReport;
  score: EnterpriseScoreResult;
}) {
  const executed =
    report.summary.passed +
    report.summary.failed +
    report.summary.skipped +
    report.summary.partial;

  return (
    <Section
      title="Enterprise audit coverage"
      description="How much of the Lighthouse audit inventory was executed and measured — separate from category quality scores above"
    >
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
        <CoverageMetric
          label="Coverage"
          value={`${report.summary.coveragePercent}`}
          unit="%"
          description="Share of inventory implemented"
        />
        <CoverageMetric
          label="Confidence"
          value={`${Math.round(score.confidenceScore * 100)}`}
          unit="%"
          description="Measurement confidence across audits"
        />
        <CoverageMetric
          label="Passed audits"
          value={String(report.summary.passed)}
          description="Rules that passed"
        />
        <CoverageMetric
          label="Failed audits"
          value={String(report.summary.failed)}
          description="Rules that failed"
        />
        <CoverageMetric
          label="Unsupported audits"
          value={String(report.summary.unsupported)}
          description="Require CDP or privileged APIs"
        />
        <CoverageMetric
          label="Executed audits"
          value={String(executed)}
          description="Rules actually run on this page"
        />
      </div>
    </Section>
  );
}

/** @deprecated Use EnterpriseAuditCoveragePanel */
export function AuditCoveragePanel({ report }: { report: EnterpriseAuditReport }) {
  const executed =
    report.summary.passed +
    report.summary.failed +
    report.summary.skipped +
    report.summary.partial;

  return (
    <Section title="Audit Coverage" description="Lighthouse-compatible audit inventory coverage">
      <Card className="grid grid-cols-2 gap-3 text-xs md:grid-cols-4">
        <Stat label="Total reviewed" value={report.summary.total} />
        <Stat label="Executed" value={executed} />
        <Stat label="Unsupported" value={report.summary.unsupported} tone="warning" />
        <Stat label="Coverage" value={`${report.summary.coveragePercent}%`} tone="accent" />
      </Card>
    </Section>
  );
}

export function PassedChecksPanel({ report }: { report: EnterpriseAuditReport }) {
  const passed = report.results.filter((r) => r.status === 'pass');
  return (
    <Section title="Passed Checks" description={`${passed.length} audits passed`}>
      <Card className="max-h-48 space-y-1 overflow-y-auto text-2xs">
        {passed.length === 0 ? (
          <p className="text-auditor-muted">No passed audits yet.</p>
        ) : (
          passed.map((audit) => (
            <div key={audit.id} className="flex items-center justify-between gap-2">
              <span className="text-auditor-text-secondary">{audit.title}</span>
              <Badge tone="success">PASS</Badge>
            </div>
          ))
        )}
      </Card>
    </Section>
  );
}

export function UnsupportedAuditsPanel({ report }: { report: EnterpriseAuditReport }) {
  const unsupported = report.results.filter((r) => r.status === 'unsupported');
  return (
    <Section
      title="Unsupported Audits"
      description="Require CDP, tracing, or privileged APIs — not faked"
    >
      <Card className="max-h-56 space-y-2 overflow-y-auto text-2xs">
        {unsupported.map((audit) => (
          <div key={audit.id} className="rounded-lg border border-auditor-border-subtle p-2">
            <div className="flex items-center gap-2">
              <Badge tone="neutral">UNSUPPORTED</Badge>
              <span className="font-medium text-auditor-text">{audit.title}</span>
            </div>
            <p className="mt-1 text-auditor-muted">{audit.unsupportedReason}</p>
            <p className="mt-1 text-auditor-muted">
              <span className="font-medium">Missing: </span>
              {audit.missingCapability}
            </p>
            {audit.futureImplementation && (
              <p className="mt-1 text-auditor-muted">
                <span className="font-medium">Future: </span>
                {audit.futureImplementation}
              </p>
            )}
          </div>
        ))}
      </Card>
    </Section>
  );
}

export function ConfidenceScorePanel({ score }: { score: EnterpriseScoreResult }) {
  return (
    <Section title="Confidence Score" description="Based on measurement confidence across audits">
      <Card className="flex items-center gap-4 text-xs">
        <div className="text-3xl font-semibold text-auditor-accent">
          {Math.round(score.confidenceScore * 100)}%
        </div>
        <div className="text-auditor-muted">
          <p>
            Overall score: {score.overallScore}/100 (max achievable {score.maxAchievableScore})
          </p>
          <p className="mt-1">{score.scoreExplanation}</p>
        </div>
      </Card>
    </Section>
  );
}

export function CategoryBreakdownPanel({ score }: { score: EnterpriseScoreResult }) {
  return (
    <Section
      title="Category details"
      description="Drill into each category for coverage, confidence, and failed audits — scores match Website health above"
    >
      <div className="space-y-2">
        {score.categories.map((category) => (
          <AccordionItem
            key={category.category}
            title={category.label}
            subtitle={`${category.failedAudits.length} failed · ${category.passedAudits.length} passed`}
            badge={
              <Badge
                tone={
                  category.score >= 90 ? 'success' : category.score >= 50 ? 'warning' : 'danger'
                }
              >
                {category.score}/100
              </Badge>
            }
            defaultOpen={category.score < 90}
          >
            <div className="space-y-2 text-2xs text-auditor-muted">
              <p className="text-sm font-semibold text-auditor-text">{category.score}/100</p>
              <p>{category.scoreExplanation}</p>
              <p>
                Coverage: {category.coveragePercent}% · Confidence:{' '}
                {Math.round(category.confidenceScore * 100)}% · Weight:{' '}
                {Math.round(category.weight * 100)}%
              </p>
              {category.failedAudits.length > 0 && (
                <div>
                  <p className="font-medium text-auditor-text-secondary">Failed audits</p>
                  <ul className="mt-1 list-disc pl-4">
                    {category.failedAudits.map((audit) => (
                      <li key={audit.id}>
                        {audit.title} (weight {audit.weight}, fix impact +{audit.fixImpact} pts)
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </AccordionItem>
        ))}
      </div>
    </Section>
  );
}

export function LighthouseComparisonPanel({ report }: { report: EnterpriseAuditReport }) {
  const { lighthouseComparison } = report;
  return (
    <Section
      title="Lighthouse Comparison"
      description="Implementation status vs Lighthouse audit set"
    >
      <Card className="grid grid-cols-2 gap-3 text-xs md:grid-cols-3">
        <Stat
          label="Lighthouse audits reviewed"
          value={lighthouseComparison.totalLighthouseAudits}
        />
        <Stat
          label="Fully implemented"
          value={lighthouseComparison.implementedFull}
          tone="success"
        />
        <Stat
          label="Partially implemented"
          value={lighthouseComparison.implementedPartial}
          tone="accent"
        />
        <Stat
          label="Unsupported (Group C)"
          value={lighthouseComparison.unsupported}
          tone="warning"
        />
        <Stat label="Coverage" value={`${lighthouseComparison.coveragePercent}%`} tone="accent" />
        <Stat label="Runnable in extension" value={AUDIT_INVENTORY_STATS.runnable} />
      </Card>
    </Section>
  );
}

export function RuleInventoryPanel({ report }: { report: EnterpriseAuditReport }) {
  const failed = report.results.filter((r) => r.status === 'fail').length;
  const passed = report.results.filter((r) => r.status === 'pass').length;
  return (
    <Section title="Rule Inventory" description="Complete audit rule inventory summary">
      <Card className="flex flex-wrap gap-2 text-2xs">
        <Badge tone="success">PASS: {passed}</Badge>
        <Badge tone="danger">FAIL: {failed}</Badge>
        <Badge tone="neutral">SKIPPED: {report.summary.skipped}</Badge>
        <Badge tone="warning">UNSUPPORTED: {report.summary.unsupported}</Badge>
        <Badge tone="accent">PARTIAL: {report.summary.partial}</Badge>
      </Card>
    </Section>
  );
}

export function DeveloperModePanel({ report }: { report: EnterpriseAuditReport }) {
  return (
    <Section
      title="Developer Mode"
      description="Every audit with status, weight, execution time, and evidence"
    >
      <Card className="max-h-80 overflow-y-auto p-0 text-2xs">
        <table className="data-table data-table-sticky">
          <caption>Enterprise audit rule inventory with status and evidence</caption>
          <thead>
            <tr>
              <th scope="col">Audit</th>
              <th scope="col">Status</th>
              <th scope="col">Weight</th>
              <th scope="col">Time</th>
              <th scope="col">Group</th>
            </tr>
          </thead>
          <tbody>
            {report.results.map((audit) => (
              <tr key={audit.id}>
                <th scope="row" className="font-normal">
                  <p className="font-medium text-auditor-text">{audit.title}</p>
                  <p className="text-auditor-muted">{audit.id}</p>
                  {audit.status === 'unsupported' && (
                    <p className="mt-1 text-auditor-warning">{audit.missingCapability}</p>
                  )}
                  {Object.keys(audit.evidence).length > 0 && (
                    <pre className="text-2xs mt-1 max-h-20 overflow-auto rounded bg-auditor-bg-elevated p-1 font-mono">
                      {JSON.stringify(audit.evidence, null, 2)}
                    </pre>
                  )}
                </th>
                <td>
                  <StatusBadge status={audit.status} />
                </td>
                <td>{audit.weight}</td>
                <td>{audit.executionTimeMs}ms</td>
                <td>{audit.group}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </Section>
  );
}

function CoverageMetric({
  label,
  value,
  unit,
  description,
}: {
  label: string;
  value: string;
  unit?: string;
  description?: string;
}) {
  return <MetricCard label={label} value={value} unit={unit} description={description} />;
}

function Stat({
  label,
  value,
  tone = 'neutral',
}: {
  label: string;
  value: string | number;
  tone?: 'neutral' | 'success' | 'warning' | 'accent';
}) {
  return (
    <div className="rounded-lg border border-auditor-border-subtle bg-auditor-bg-elevated p-3">
      <p className="text-auditor-muted">{label}</p>
      <p className="mt-1 text-lg font-semibold text-auditor-text">
        {typeof value === 'number' ? value : value}
      </p>
      {tone !== 'neutral' && <Badge tone={tone}>{tone}</Badge>}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const tone =
    status === 'pass'
      ? 'success'
      : status === 'fail'
        ? 'danger'
        : status === 'unsupported'
          ? 'warning'
          : 'neutral';
  return <Badge tone={tone}>{status.toUpperCase()}</Badge>;
}
