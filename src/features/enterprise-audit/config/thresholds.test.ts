import { describe, expect, it } from 'vitest';
import { ENTERPRISE_AUDIT_THRESHOLDS } from '@features/enterprise-audit';
import { hasPageUrlChanged } from '@shared/utils/url';

describe('enterprise thresholds', () => {
  it('uses configurable threshold constants', () => {
    expect(ENTERPRISE_AUDIT_THRESHOLDS.totalBlockingTimeMs).toBe(200);
    expect(ENTERPRISE_AUDIT_THRESHOLDS.titleMaxLength).toBe(60);
  });
});

describe('url comparison', () => {
  it('ignores hash changes by default', () => {
    expect(
      hasPageUrlChanged('https://example.com/page', 'https://example.com/page#section', false),
    ).toBe(false);
  });

  it('detects path changes', () => {
    expect(hasPageUrlChanged('https://example.com/a', 'https://example.com/b', false)).toBe(true);
  });
});
