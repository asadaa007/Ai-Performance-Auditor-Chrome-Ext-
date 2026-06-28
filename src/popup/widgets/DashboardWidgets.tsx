import { WEB_VITALS_THRESHOLDS } from '@shared/constants';
import { Card, Section, StatusPill } from '@shared/components';
import type { AuditResult, WebVitalsMetric } from '@shared/types';
import {
  confidenceLabel,
  displayUnit,
  displayValue,
  ratingTone,
  vitalsStatusLabel,
} from '@shared/utils';

const VITAL_KEYS = ['lcp', 'cls', 'inp', 'fcp', 'ttfb'] as const;

const VITAL_LABELS: Record<(typeof VITAL_KEYS)[number], string> = {
  lcp: 'LCP',
  cls: 'CLS',
  inp: 'INP',
  fcp: 'FCP',
  ttfb: 'TTFB',
};

function lighthouseRating(metric: WebVitalsMetric, key: (typeof VITAL_KEYS)[number]): string {
  if (metric.status !== 'measured' || metric.value === null) {
    return 'N/A';
  }
  const thresholds = WEB_VITALS_THRESHOLDS[key];
  if (metric.value <= thresholds.good) return 'Good';
  if (metric.value <= thresholds.poor) return 'Needs Improvement';
  return 'Poor';
}

function ratingsMatch(ours: string, lighthouse: string): boolean {
  if (lighthouse === 'N/A') return true;
  return ours.toLowerCase().includes(lighthouse.toLowerCase().split(' ')[0] ?? '');
}

export function WebVitalsGrid({ result }: { result: AuditResult }) {
  const vitals = VITAL_KEYS.map((key) => ({
    key,
    metric: result.webVitals[key],
  }));

  return (
    <Section title="Detailed metrics" description="Core Web Vitals with confidence and status">
      <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
        {vitals.map(({ key, metric }) => (
          <Card key={key} className="space-y-2 p-3 text-xs">
            <div className="flex items-center justify-between">
              <p className="font-medium text-auditor-text">{VITAL_LABELS[key]}</p>
              <StatusPill
                label={vitalsStatusLabel(metric)}
                tone={ratingTone(metric.rating, metric.status)}
              />
            </div>
            <p className="text-lg font-semibold text-auditor-text">
              {displayValue(metric)}
              {displayUnit(metric) ? ` ${displayUnit(metric)}` : ''}
            </p>
            <p className="text-2xs text-auditor-muted">
              Confidence: {confidenceLabel(metric.confidence)}
            </p>
          </Card>
        ))}
      </div>
    </Section>
  );
}

export function VitalsValidationPanel({ result }: { result: AuditResult }) {
  const rows = VITAL_KEYS.map((key) => {
    const metric = result.webVitals[key];
    const ours = vitalsStatusLabel(metric);
    const lighthouse = lighthouseRating(metric, key);
    const match = ratingsMatch(ours, lighthouse);

    return {
      key,
      label: VITAL_LABELS[key],
      ourValue:
        metric.status === 'measured' && metric.value !== null
          ? `${displayValue(metric)}${displayUnit(metric) ? ` ${displayUnit(metric)}` : ''}`
          : displayValue(metric),
      lighthouseValue: lighthouse,
      difference: match ? 'Aligned' : `${ours} vs ${lighthouse}`,
      match,
    };
  });

  return (
    <Section
      title="Lighthouse validation"
      description="Compare ratings against Chrome Lighthouse thresholds (same value bands)"
    >
      <Card className="overflow-hidden p-0 text-xs">
        <table className="data-table">
          <caption>Lighthouse validation comparison for Core Web Vitals</caption>
          <thead>
            <tr>
              <th scope="col">Metric</th>
              <th scope="col">Our value</th>
              <th scope="col">Lighthouse rating</th>
              <th scope="col">Difference</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr
                key={row.key}
                className={row.match ? '' : 'bg-auditor-danger-muted/20'}
              >
                <th scope="row" className="font-medium text-auditor-text">
                  {row.label}
                </th>
                <td className="font-mono">{row.ourValue}</td>
                <td>{row.lighthouseValue}</td>
                <td>{row.difference}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="border-t border-auditor-border-subtle px-3 py-2 text-2xs text-auditor-muted">
          Run Chrome DevTools Lighthouse on the same page to compare raw values side-by-side.
          Highlighted rows indicate rating band differences.
        </p>
      </Card>
    </Section>
  );
}

export function OverviewStats({ result }: { result: AuditResult }) {
  const stats = [
    {
      label: 'Collection time',
      value: String(result.meta.collectionDurationMs),
      unit: 'ms',
      description: 'Audit collector runtime',
    },
    {
      label: 'Web Vitals window',
      value: String(result.webVitals.collectionDurationMs ?? 0),
      unit: 'ms',
      description: 'Vitals observation duration',
    },
    {
      label: 'Resources',
      value: String(result.resources.totalRequests),
      description: 'Network requests captured',
    },
    {
      label: 'DOM nodes',
      value: String(result.dom.totalNodes),
      description: 'Total nodes in document',
    },
    {
      label: 'Images',
      value: String(result.images.totalImages),
      description: 'Image elements found',
    },
    {
      label: 'Scripts',
      value: String(result.javascript.totalScripts),
      description: 'Script tags on page',
    },
  ];

  return (
    <Section title="Overview" description="Key counts from the latest audit">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
        {stats.map((stat) => (
          <Card key={stat.label} className="p-3 text-xs">
            <p className="text-auditor-muted">{stat.label}</p>
            <p className="mt-1 text-lg font-semibold text-auditor-text">
              {stat.value}
              {stat.unit ? ` ${stat.unit}` : ''}
            </p>
            <p className="mt-1 text-2xs text-auditor-muted">{stat.description}</p>
          </Card>
        ))}
      </div>
    </Section>
  );
}
