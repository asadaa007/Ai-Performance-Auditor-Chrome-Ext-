import { Badge, Card, EmptyState, Section } from '@shared/components';
import type { AuditResult } from '@shared/types';
import { formatBytes, formatNumber, formatUrl } from '@shared/utils';

export function ImagesTable({ result }: { result: AuditResult }) {
  if (result.images.images.length === 0) {
    return (
      <Section title="Image inventory" description="No images detected on this page">
        <EmptyState
          title="No images found"
          description="This page did not contain any img elements during the audit."
          icon="◎"
        />
      </Section>
    );
  }

  return (
    <Section
      title="Image inventory"
      description={`${result.images.totalImages} images · ${result.images.modernFormatCount} modern format`}
    >
      <Card padding="sm" className="overflow-x-auto p-0">
        <table className="data-table min-w-[640px]">
          <caption>Image inventory with dimensions, format flags, and transfer size</caption>
          <thead>
            <tr>
              <th scope="col">Preview</th>
              <th scope="col">Source</th>
              <th scope="col">Dimensions</th>
              <th scope="col">Display</th>
              <th scope="col">Flags</th>
            </tr>
          </thead>
          <tbody>
            {result.images.images.map((image, index) => (
              <tr key={`${image.src}-${index}`}>
                <td>
                  {image.src ? (
                    <img
                      src={image.src}
                      alt=""
                      className="h-10 w-10 rounded-md border border-auditor-border-subtle object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <div className="h-10 w-10 rounded-md bg-auditor-surface" />
                  )}
                </td>
                <td className="max-w-[180px] truncate font-mono text-2xs text-auditor-text-secondary">
                  {formatUrl(image.src, 40)}
                </td>
                <td className="text-auditor-muted-foreground">
                  {formatNumber(image.naturalWidth)}×{formatNumber(image.naturalHeight)}
                </td>
                <td className="text-auditor-muted-foreground">
                  {formatNumber(image.displayWidth)}×{formatNumber(image.displayHeight)}
                </td>
                <td>
                  <div className="flex flex-wrap gap-1">
                    {image.lazyLoaded && <Badge tone="success">Lazy</Badge>}
                    {image.isModernFormat && <Badge tone="accent">Modern</Badge>}
                    {image.missingDimensions && <Badge tone="warning">No size</Badge>}
                    {image.optimizationOpportunities.map((flag) => (
                      <Badge key={flag} tone="warning">
                        {flag}
                      </Badge>
                    ))}
                    {image.transferSize !== null && (
                      <Badge tone="neutral">{formatBytes(image.transferSize)}</Badge>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </Section>
  );
}
