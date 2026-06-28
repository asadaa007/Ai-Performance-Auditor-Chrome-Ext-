import type { WebVitalsMetric } from '@shared/types';

export function formatMs(value: number | null | undefined): string {
  if (value === null || value === undefined || !Number.isFinite(value)) {
    return '—';
  }
  return `${Math.round(value)}`;
}

export function formatUnitless(value: number | null | undefined): string {
  if (value === null || value === undefined || !Number.isFinite(value)) {
    return '—';
  }
  return value.toFixed(3);
}

export function formatBytes(bytes: number | null | undefined): string {
  if (bytes === null || bytes === undefined || !Number.isFinite(bytes)) {
    return '—';
  }
  if (bytes === 0) {
    return '0 B';
  }
  const units = ['B', 'KB', 'MB', 'GB'];
  const index = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  const size = bytes / 1024 ** index;
  return `${size.toFixed(index === 0 ? 0 : 1)} ${units[index]}`;
}

export function formatNumber(value: number | null | undefined): string {
  if (value === null || value === undefined || !Number.isFinite(value)) {
    return '—';
  }
  return value.toLocaleString();
}

export function formatUrl(url: string | null | undefined, maxLength = 48): string {
  if (!url) {
    return 'No URL';
  }
  if (url.length <= maxLength) {
    return url;
  }
  return `${url.slice(0, maxLength - 1)}…`;
}

export function formatTimestamp(timestamp: number | null | undefined): string {
  if (!timestamp) {
    return '—';
  }
  return new Date(timestamp).toLocaleString();
}

export function ratingLabel(rating: WebVitalsMetric['rating']): string {
  switch (rating) {
    case 'good':
      return 'Good';
    case 'needs-improvement':
      return 'Needs work';
    case 'poor':
      return 'Poor';
    default:
      return 'Unknown';
  }
}

export function ratingTone(
  rating: WebVitalsMetric['rating'],
  status?: WebVitalsMetric['status'],
): 'success' | 'warning' | 'danger' | 'neutral' | 'accent' {
  if (status && status !== 'measured') {
    return 'neutral';
  }
  switch (rating) {
    case 'good':
      return 'success';
    case 'needs-improvement':
      return 'warning';
    case 'poor':
      return 'danger';
    default:
      return 'neutral';
  }
}

export function vitalsStatusLabel(metric: WebVitalsMetric): string {
  switch (metric.status) {
    case 'not-supported':
      return 'Not Supported';
    case 'collecting':
      return 'Collecting...';
    case 'waiting-for-interaction':
      return 'Waiting for interaction';
    case 'not-measured':
      return 'Not Measured';
    case 'measured':
      return ratingLabel(metric.rating);
    default:
      return 'Unknown';
  }
}

export function confidenceLabel(confidence: WebVitalsMetric['confidence']): string {
  return confidence.charAt(0).toUpperCase() + confidence.slice(1);
}

export function displayValue(metric: WebVitalsMetric): string {
  if (metric.status === 'not-supported') {
    return 'Not Supported';
  }
  if (metric.status === 'collecting') {
    return 'Collecting...';
  }
  if (metric.status === 'waiting-for-interaction') {
    return 'Waiting for interaction';
  }
  if (metric.status === 'not-measured') {
    return 'Not Measured';
  }
  if (metric.value === null) {
    return '—';
  }
  return metric.unit === 'unitless' ? formatUnitless(metric.value) : formatMs(metric.value);
}

export function displayUnit(metric: WebVitalsMetric): string {
  if (metric.status !== 'measured' || metric.value === null) {
    return '';
  }
  return metric.unit === 'unitless' ? '' : 'ms';
}
