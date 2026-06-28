import { PageShell } from '@popup/components/PageShell';
import { Card, CodeBlock, Section } from '@shared/components';

export function MetaPage() {
  return (
    <PageShell title="Meta" description="Document metadata and social tags">
      {(result) => {
        const meta = result.metaTags;
        return (
          <div className="space-y-4">
            <Section title="Primary meta">
              <Card className="space-y-2 text-xs">
                <MetaRow label="Title" value={meta.title} />
                <MetaRow label="Description" value={meta.description} />
                <MetaRow label="Canonical" value={meta.canonicalUrl} />
                <MetaRow label="Viewport" value={meta.viewport} />
                <MetaRow label="Robots" value={meta.robots} />
                <MetaRow label="Charset" value={meta.charset} />
              </Card>
            </Section>
            <Section title="Open Graph">
              <CodeBlock code={JSON.stringify(meta.openGraph, null, 2) || '{}'} />
            </Section>
            <Section title="Twitter">
              <CodeBlock code={JSON.stringify(meta.twitter, null, 2) || '{}'} />
            </Section>
          </div>
        );
      }}
    </PageShell>
  );
}

function MetaRow({ label, value }: { label: string; value: string | null }) {
  return (
    <div className="grid grid-cols-[100px_1fr] gap-2 border-b border-auditor-border-subtle/60 py-2 last:border-0">
      <span className="text-auditor-muted">{label}</span>
      <span className="break-all text-auditor-text-secondary">{value ?? '—'}</span>
    </div>
  );
}
