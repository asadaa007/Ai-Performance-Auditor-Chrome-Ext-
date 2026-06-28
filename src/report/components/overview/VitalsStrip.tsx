import { Link } from 'react-router-dom';
import { WEB_VITALS_THRESHOLDS } from '@shared/constants';
import type { AuditResult } from '@shared/types';
import { Card, StatusPill } from '@shared/components';
import { DashboardSection } from '@report/components/overview/DashboardSection';
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

function thresholdPercent(
  key: (typeof VITAL_KEYS)[number],
  value: number | null,
): number {
  if (value === null) return 0;
  const { good, poor } = WEB_VITALS_THRESHOLDS[key];
  if (value <= good) return 100;
  if (value >= poor) return 15;
  return Math.round(100 - ((value - good) / (poor - good)) * 70);
}

export function VitalsStrip({ result }: { result: AuditResult }) {
  return (
    <DashboardSection
      icon="chart"
      title="Core Web Vitals"
      subtitle="Measured values against Lighthouse-style thresholds — open Performance for full timing breakdown"
      action={
        <Link
          to="/performance"
          className="text-2xs font-medium text-auditor-accent hover:text-auditor-accent-hover"
        >
          View performance →
        </Link>
      }
    >
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {VITAL_KEYS.map((key) => {
          const metric = result.webVitals[key];
          const fill = thresholdPercent(key, metric.value);
          const tone = ratingTone(metric.rating, metric.status);

          return (
            <Card key={key} variant="elevated" padding="sm" className="min-w-0 space-y-3">
              <div className="flex items-center justify-between gap-2">
                <span className="font-mono text-xs font-semibold text-auditor-text">
                  {VITAL_LABELS[key]}
                </span>
                <StatusPill label={vitalsStatusLabel(metric)} tone={tone} />
              </div>
              <p className="truncate text-xl font-bold tabular-nums text-auditor-text">
                {displayValue(metric)}
                {displayUnit(metric) ? (
                  <span className="ml-1 text-xs font-normal text-auditor-muted">
                    {displayUnit(metric)}
                  </span>
                ) : null}
              </p>
              <div className="score-bar-track">
                <div
                  className={`score-bar-fill bg-gradient-to-r ${
                    tone === 'success'
                      ? 'from-auditor-success/80 to-auditor-success'
                      : tone === 'warning'
                        ? 'from-auditor-warning/80 to-auditor-warning'
                        : 'from-auditor-danger/80 to-auditor-danger'
                  }`}
                  style={{ width: `${fill}%` }}
                />
              </div>
              <p className="text-3xs text-auditor-muted">
                Confidence: {confidenceLabel(metric.confidence)}
              </p>
            </Card>
          );
        })}
      </div>
    </DashboardSection>
  );
}
