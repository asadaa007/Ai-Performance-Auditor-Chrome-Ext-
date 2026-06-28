import { MetricCard, Section } from '@shared/components';
import type { AuditResult } from '@shared/types';
import { formatNumber } from '@shared/utils';

export function DomOverview({ result }: { result: AuditResult }) {
  const cards = [
    {
      label: 'Total nodes',
      value: formatNumber(result.dom.totalNodes),
      description: 'All DOM nodes',
    },
    {
      label: 'Max depth',
      value: formatNumber(result.dom.maxDepth),
      description: 'Deepest nesting level',
    },
    {
      label: 'Scripts',
      value: formatNumber(result.dom.scriptCount),
      description: 'Script elements',
    },
    {
      label: 'Stylesheets',
      value: formatNumber(result.dom.stylesheetCount),
      description: 'CSS links + style tags',
    },
    {
      label: 'Iframes',
      value: formatNumber(result.dom.iframeCount),
      description: 'Embedded frames',
    },
    {
      label: 'Shadow roots',
      value: formatNumber(result.dom.shadowRootCount),
      description: 'Open shadow DOM',
    },
    {
      label: 'Body children',
      value: formatNumber(result.dom.bodyChildCount),
      description: 'Direct body children',
    },
    {
      label: 'Ready state',
      value: result.dom.documentReadyState ?? '—',
      description: 'Document readiness',
    },
  ];

  return (
    <Section title="DOM structure" description="Document tree metrics">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {cards.map((card) => (
          <MetricCard key={card.label} {...card} />
        ))}
      </div>
    </Section>
  );
}

export function TopElements({ result }: { result: AuditResult }) {
  const entries = Object.entries(result.dom.elementCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 12);

  return (
    <Section title="Top elements" description="Most frequent tag names">
      <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
        {entries.map(([tag, count]) => (
          <div
            key={tag}
            className="rounded-lg border border-auditor-border-subtle bg-auditor-surface px-3 py-2"
          >
            <p className="font-mono text-xs text-auditor-accent">{tag}</p>
            <p className="text-lg font-semibold text-auditor-text">{formatNumber(count)}</p>
          </div>
        ))}
      </div>
    </Section>
  );
}
