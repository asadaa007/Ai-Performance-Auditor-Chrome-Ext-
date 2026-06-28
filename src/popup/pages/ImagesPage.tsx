import { PageShell } from '@popup/components/PageShell';
import { ImagesTable } from '@popup/widgets/ImagesWidgets';
import { MetricCard, Section } from '@shared/components';
import { formatNumber } from '@shared/utils';

export function ImagesPage() {
  return (
    <PageShell title="Images" description="Image inventory and optimization flags">
      {(result) => (
        <div className="space-y-6">
          <Section title="Summary">
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
              <MetricCard label="Total" value={formatNumber(result.images.totalImages)} />
              <MetricCard label="Lazy loaded" value={formatNumber(result.images.lazyLoadedCount)} />
              <MetricCard
                label="Missing dimensions"
                value={formatNumber(result.images.missingDimensionsCount)}
              />
              <MetricCard
                label="Modern format"
                value={formatNumber(result.images.modernFormatCount)}
              />
            </div>
          </Section>
          <ImagesTable result={result} />
        </div>
      )}
    </PageShell>
  );
}
