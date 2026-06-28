import { motion } from 'framer-motion';
import { useState } from 'react';
import type { AnalysisResult, PerformanceIssue } from '@features/analysis';
import { Badge, Card, EmptyState, Modal, Section, StatusPill } from '@shared/components';

const SEVERITY_TONE = {
  Critical: 'danger',
  High: 'danger',
  Medium: 'warning',
  Low: 'neutral',
  Info: 'accent',
} as const;

const IMPACT_TONE = {
  'Very High': 'danger',
  High: 'warning',
  Medium: 'neutral',
  Low: 'neutral',
  Unknown: 'neutral',
} as const;

interface TopIssuesPanelProps {
  analysis: AnalysisResult | null;
  limit?: number;
}

export function TopIssuesPanel({ analysis, limit = 8 }: TopIssuesPanelProps) {
  const [selected, setSelected] = useState<PerformanceIssue | null>(null);

  if (!analysis) {
    return null;
  }

  const issues = analysis.issues.slice(0, limit);

  return (
    <Section
      title="Top issues"
      description={`${analysis.issueCount} issues detected from ${analysis.rulesExecuted} rules`}
    >
      {issues.length === 0 ? (
        <EmptyState
          title="No issues detected"
          description="The current rule set did not flag any performance problems on this page."
          icon="✓"
        />
      ) : (
        <Card padding="sm" className="divide-y divide-auditor-border-subtle p-0">
          {issues.map((issue, index) => (
            <motion.button
              key={issue.id}
              type="button"
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.03 }}
              onClick={() => setSelected(issue)}
              className="flex w-full flex-col gap-2 px-3 py-3 text-left transition-colors hover:bg-auditor-surface-hover"
            >
              <div className="flex items-start justify-between gap-2">
                <p className="text-sm font-medium text-auditor-text">{issue.title}</p>
                <Badge tone={SEVERITY_TONE[issue.severity]}>{issue.severity}</Badge>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Badge tone="accent">{issue.category}</Badge>
                <StatusPill label={`Impact: ${issue.impact}`} tone={IMPACT_TONE[issue.impact]} />
                <span className="text-2xs text-auditor-muted">{issue.estimatedTimeToFix}</span>
              </div>
              {issue.affectedResources.length > 0 && (
                <p className="truncate font-mono text-2xs text-auditor-muted">
                  {issue.affectedResources[0]}
                  {issue.affectedResources.length > 1
                    ? ` +${issue.affectedResources.length - 1} more`
                    : ''}
                </p>
              )}
            </motion.button>
          ))}
        </Card>
      )}

      <IssueDetailModal issue={selected} onClose={() => setSelected(null)} />
    </Section>
  );
}

function IssueDetailModal({
  issue,
  onClose,
}: {
  issue: PerformanceIssue | null;
  onClose: () => void;
}) {
  if (!issue) {
    return null;
  }

  return (
    <Modal open={Boolean(issue)} title={issue.title} onClose={onClose}>
      <div className="max-h-80 space-y-3 overflow-y-auto text-xs">
        <p className="leading-relaxed text-auditor-muted-foreground">{issue.description}</p>

        <DetailGrid
          rows={[
            ['Category', issue.category],
            ['Subcategory', issue.subcategory],
            ['Severity', issue.severity],
            ['Impact', issue.impact],
            ['Confidence', `${Math.round(issue.confidence * 100)}%`],
            ['Detected by', issue.detectedBy],
            ['Metric', issue.metric],
            ['Current value', String(issue.currentValue ?? '—')],
            ['Reference value', String(issue.recommendedValue ?? '—')],
            ['Estimated improvement', issue.estimatedImprovement ?? '—'],
            ['Fix time estimate', issue.estimatedTimeToFix],
          ]}
        />

        {issue.affectedResources.length > 0 && (
          <div>
            <p className="mb-1 font-medium text-auditor-text-secondary">Affected resources</p>
            <ul className="space-y-1 font-mono text-2xs text-auditor-muted">
              {issue.affectedResources.map((resource) => (
                <li key={resource} className="break-all">
                  {resource}
                </li>
              ))}
            </ul>
          </div>
        )}

        {issue.documentationLinks.length > 0 && (
          <div>
            <p className="mb-1 font-medium text-auditor-text-secondary">Documentation</p>
            <ul className="space-y-1 text-2xs text-auditor-accent">
              {issue.documentationLinks.map((link) => (
                <li key={link}>
                  <a href={link} target="_blank" rel="noreferrer" className="hover:underline">
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}

        {issue.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {issue.tags.map((tag) => (
              <Badge key={tag} tone="neutral">
                {tag}
              </Badge>
            ))}
          </div>
        )}
      </div>
    </Modal>
  );
}

function DetailGrid({ rows }: { rows: Array<[string, string]> }) {
  return (
    <dl className="grid grid-cols-[120px_1fr] gap-x-3 gap-y-2 rounded-lg border border-auditor-border-subtle bg-auditor-bg-elevated p-3">
      {rows.map(([label, value]) => (
        <div key={label} className="contents">
          <dt className="text-auditor-muted">{label}</dt>
          <dd className="text-auditor-text-secondary">{value}</dd>
        </div>
      ))}
    </dl>
  );
}
