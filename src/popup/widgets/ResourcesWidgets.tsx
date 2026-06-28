import { useMemo, useState } from 'react';
import { AccordionItem, Badge, Card, EmptyState, Section, Tabs } from '@shared/components';
import type { AuditResult, ResourceEntry } from '@shared/types';
import { formatBytes, formatMs, formatUrl } from '@shared/utils';

type ResourceTab = 'js' | 'css' | 'images' | 'fonts' | 'fetch' | 'duplicates' | 'slow';
type SortKey = 'name' | 'duration' | 'size';

function sortResources(items: ResourceEntry[], sortKey: SortKey): ResourceEntry[] {
  return [...items].sort((a, b) => {
    if (sortKey === 'name') {
      return a.name.localeCompare(b.name);
    }
    if (sortKey === 'duration') {
      return b.duration - a.duration;
    }
    return (b.transferSize ?? 0) - (a.transferSize ?? 0);
  });
}

export function ResourcesExplorer({ result }: { result: AuditResult }) {
  const [tab, setTab] = useState<ResourceTab>('js');
  const [query, setQuery] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('duration');

  const groups = useMemo(
    () => ({
      js: result.resources.jsFiles,
      css: result.resources.cssFiles,
      images: result.resources.images,
      fonts: result.resources.fonts,
      fetch: result.resources.fetchXhr,
      duplicates: result.resources.duplicateResources.flatMap((group) => group.entries),
      slow: result.resources.slowResources,
    }),
    [result],
  );

  const items = useMemo(() => {
    const list = groups[tab];
    const filtered = list.filter((item) => item.name.toLowerCase().includes(query.toLowerCase()));
    return sortResources(filtered, sortKey);
  }, [groups, tab, query, sortKey]);

  return (
    <div className="space-y-4">
      <Tabs
        items={[
          { id: 'js' as const, label: `JS (${groups.js.length})` },
          { id: 'css' as const, label: `CSS (${groups.css.length})` },
          { id: 'images' as const, label: `Images (${groups.images.length})` },
          { id: 'fonts' as const, label: `Fonts (${groups.fonts.length})` },
          { id: 'fetch' as const, label: `XHR (${groups.fetch.length})` },
          {
            id: 'duplicates' as const,
            label: `Duplicates (${result.resources.duplicateResources.length})`,
          },
          { id: 'slow' as const, label: `Slow (${groups.slow.length})` },
        ]}
        value={tab}
        onChange={setTab}
      />

      <div className="flex flex-wrap gap-2" role="search" aria-label="Filter resources">
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search resources…"
          aria-label="Search resources"
          className="form-control h-8 min-w-[200px] flex-1"
        />
        <select
          value={sortKey}
          onChange={(event) => setSortKey(event.target.value as SortKey)}
          aria-label="Sort resources"
          className="form-control h-8"
        >
          <option value="duration">Sort: Duration</option>
          <option value="size">Sort: Size</option>
          <option value="name">Sort: Name</option>
        </select>
      </div>

      <Section
        title="Resource list"
        description={`${items.length} items · ${formatBytes(result.resources.totalTransferSize)} total transfer`}
      >
        <Card padding="sm" className="max-h-80 overflow-y-auto p-0">
          {items.length === 0 ? (
            <EmptyState
              title="No resources in this view"
              description="Try another tab or clear your search filter."
              icon="◎"
            />
          ) : (
            items.map((item, index) => (
              <AccordionItem
                key={`${item.name}-${index}`}
                title={formatUrl(item.name, 72)}
                subtitle={`${item.initiatorType} · ${formatMs(item.duration)} ms`}
                badge={
                  <Badge tone={item.fromCache ? 'success' : 'neutral'}>
                    {item.fromCache ? 'Cached' : formatBytes(item.transferSize)}
                  </Badge>
                }
              >
                <dl className="grid grid-cols-2 gap-2 text-2xs text-auditor-muted-foreground">
                  <div>
                    <dt>Encoded</dt>
                    <dd className="text-auditor-text-secondary">
                      {formatBytes(item.encodedBodySize)}
                    </dd>
                  </div>
                  <div>
                    <dt>Decoded</dt>
                    <dd className="text-auditor-text-secondary">
                      {formatBytes(item.decodedBodySize)}
                    </dd>
                  </div>
                  <div>
                    <dt>Start</dt>
                    <dd className="text-auditor-text-secondary">{formatMs(item.startTime)} ms</dd>
                  </div>
                  <div>
                    <dt>Type</dt>
                    <dd className="text-auditor-text-secondary">{item.initiatorType}</dd>
                  </div>
                </dl>
              </AccordionItem>
            ))
          )}
        </Card>
      </Section>
    </div>
  );
}
