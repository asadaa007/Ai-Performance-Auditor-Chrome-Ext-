import { useVirtualizer } from '@tanstack/react-virtual';
import { AnimatePresence, motion } from 'framer-motion';
import { useMemo, useRef, useState } from 'react';
import type { PerformanceIssue } from '@features/analysis';
import { ExplainIssuePanel } from '@report/components/ExplainIssuePanel';
import { useReportUiStore } from '@report/store/uiStore';
import { Badge, Button, Card, CodeBlock, EmptyState, StatusPill } from '@shared/components';

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

function severityBorderClass(severity: PerformanceIssue['severity']): string {
  if (severity === 'Critical') {
    return 'issue-card-critical';
  }
  if (severity === 'High') {
    return 'issue-card-high';
  }
  return 'issue-card';
}

interface IssueCardProps {
  issue: PerformanceIssue;
  defaultExpanded?: boolean;
}

export function IssueCard({ issue, defaultExpanded = false }: IssueCardProps) {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const [showCode, setShowCode] = useState(false);
  const [explainOpen, setExplainOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const pinnedIssueIds = useReportUiStore((s) => s.pinnedIssueIds);
  const bookmarkedIssueIds = useReportUiStore((s) => s.bookmarkedIssueIds);
  const togglePinned = useReportUiStore((s) => s.togglePinned);
  const toggleBookmarked = useReportUiStore((s) => s.toggleBookmarked);

  const isPinned = pinnedIssueIds.includes(issue.id);
  const isBookmarked = bookmarkedIssueIds.includes(issue.id);

  const codeSnippet = useMemo(() => {
    if (issue.affectedResources.length === 0) {
      return null;
    }
    return issue.affectedResources.slice(0, 3).join('\n');
  }, [issue.affectedResources]);

  const copyCode = async () => {
    if (!codeSnippet) {
      return;
    }
    await navigator.clipboard.writeText(codeSnippet);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Card
      padding="sm"
      className={`issue-card overflow-hidden ${severityBorderClass(issue.severity)}`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1 space-y-2.5">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-sm font-semibold leading-snug text-auditor-text">{issue.title}</h3>
            <Badge tone={SEVERITY_TONE[issue.severity]}>{issue.severity}</Badge>
            {isPinned && <Badge tone="accent">Pinned</Badge>}
            {isBookmarked && <Badge tone="neutral">Bookmarked</Badge>}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <StatusPill label={`Impact: ${issue.impact}`} tone={IMPACT_TONE[issue.impact]} />
            {issue.estimatedImprovement && (
              <StatusPill label={`Gain: ${issue.estimatedImprovement}`} tone="success" />
            )}
            <StatusPill label={`Effort: ${issue.estimatedTimeToFix}`} tone="neutral" />
            <Badge tone="accent">{issue.category}</Badge>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-1">
          <Button
            size="sm"
            variant={isPinned ? 'secondary' : 'ghost'}
            onClick={() => togglePinned(issue.id)}
            aria-label={isPinned ? 'Unpin issue' : 'Pin issue'}
            aria-pressed={isPinned}
          >
            {isPinned ? 'Pinned' : 'Pin'}
          </Button>
          <Button
            size="sm"
            variant={isBookmarked ? 'secondary' : 'ghost'}
            onClick={() => toggleBookmarked(issue.id)}
            aria-label={isBookmarked ? 'Remove bookmark' : 'Bookmark issue'}
            aria-pressed={isBookmarked}
          >
            {isBookmarked ? 'Saved' : 'Save'}
          </Button>
        </div>
      </div>

      {issue.affectedResources.length > 0 && (
        <p className="mt-3 truncate font-mono text-2xs text-auditor-muted">
          {issue.affectedResources[0]}
          {issue.affectedResources.length > 1 ? ` +${issue.affectedResources.length - 1} more` : ''}
        </p>
      )}

      <div className="mt-4 flex flex-wrap gap-2">
        <Button
          size="sm"
          variant="secondary"
          onClick={() => setExpanded((value) => !value)}
          aria-expanded={expanded}
        >
          {expanded ? 'Hide details' : 'View details'}
        </Button>
        <Button size="sm" variant="primary" onClick={() => setExplainOpen(true)}>
          Explain with AI
        </Button>
        {codeSnippet && (
          <>
            <Button size="sm" variant="ghost" onClick={() => setShowCode((value) => !value)}>
              {showCode ? 'Hide code' : 'Show code'}
            </Button>
            <Button size="sm" variant="ghost" onClick={() => void copyCode()}>
              {copied ? 'Copied' : 'Copy code'}
            </Button>
          </>
        )}
      </div>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="overflow-hidden"
          >
            <div className="mt-4 space-y-4 border-t border-auditor-border-subtle pt-4 text-xs">
              <p className="leading-relaxed text-auditor-muted-foreground">{issue.description}</p>
              <div className="grid gap-2 sm:grid-cols-2">
                <EvidenceRow label="Metric" value={issue.metric} />
                <EvidenceRow label="Current" value={String(issue.currentValue ?? '—')} />
                <EvidenceRow label="Recommended" value={String(issue.recommendedValue ?? '—')} />
                <EvidenceRow label="Detected by" value={issue.detectedBy} />
              </div>
              {issue.affectedResources.length > 0 && (
                <div>
                  <p className="mb-2 font-medium text-auditor-text-secondary">Affected resources</p>
                  <ul className="max-h-36 space-y-1 overflow-y-auto rounded-lg bg-auditor-bg-elevated p-2 font-mono text-2xs text-auditor-muted">
                    {issue.affectedResources.map((resource) => (
                      <li key={resource} className="truncate">
                        {resource}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {issue.documentationLinks.length > 0 && (
                <div className="flex flex-wrap gap-3">
                  {issue.documentationLinks.map((link, index) => (
                    <a
                      key={link}
                      href={link}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs font-medium text-auditor-accent hover:underline"
                    >
                      Documentation {issue.documentationLinks.length > 1 ? index + 1 : ''}
                    </a>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {showCode && codeSnippet && <CodeBlock code={codeSnippet} className="mt-4" />}

      <ExplainIssuePanel issue={issue} open={explainOpen} onClose={() => setExplainOpen(false)} />
    </Card>
  );
}

function EvidenceRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-auditor-border-subtle bg-auditor-bg-elevated px-3 py-2">
      <p className="text-3xs font-medium uppercase tracking-wide text-auditor-muted">{label}</p>
      <p className="mt-1 truncate font-mono text-2xs text-auditor-text-secondary">{value}</p>
    </div>
  );
}

interface VirtualIssueListProps {
  issues: PerformanceIssue[];
}

export function VirtualIssueList({ issues }: VirtualIssueListProps) {
  const parentRef = useRef<HTMLDivElement>(null);
  const virtualizer = useVirtualizer({
    count: issues.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 200,
    overscan: 5,
  });

  if (issues.length === 0) {
    return (
      <EmptyState
        title="No issues match your filters"
        description="Try adjusting severity, category, or search terms. Bookmark issues to review them later."
        icon="◎"
      />
    );
  }

  return (
    <div ref={parentRef} className="max-h-[70vh] overflow-y-auto pr-1" role="list">
      <div
        style={{
          height: `${virtualizer.getTotalSize()}px`,
          width: '100%',
          position: 'relative',
        }}
      >
        {virtualizer.getVirtualItems().map((item) => {
          const issue = issues[item.index];
          return (
            <div
              key={issue.id}
              role="listitem"
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                transform: `translateY(${item.start}px)`,
              }}
              className="pb-4"
            >
              <IssueCard issue={issue} />
            </div>
          );
        })}
      </div>
    </div>
  );
}
