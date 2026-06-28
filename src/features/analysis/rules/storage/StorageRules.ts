import { ANALYSIS_THRESHOLDS } from '@features/analysis/constants/thresholds';
import { createIssue } from '@features/analysis/utils/createIssue';
import type { AnalysisRule } from '@features/analysis/types';
import type { AuditResult } from '@shared/types';
import { formatBytes } from '@shared/utils';

export const largeStorageUsageRule: AnalysisRule = {
  id: 'large-storage-usage',
  detect(audit: AuditResult) {
    const total =
      audit.storage.localStorage.estimatedSizeBytes +
      audit.storage.sessionStorage.estimatedSizeBytes;

    if (total < ANALYSIS_THRESHOLDS.storageBytes) {
      return null;
    }

    return createIssue({
      id: 'large-storage-usage',
      title: 'Large web storage footprint',
      description: `Combined localStorage and sessionStorage estimated size is ${formatBytes(total)}.`,
      category: 'Storage',
      subcategory: 'Web storage',
      severity: total > ANALYSIS_THRESHOLDS.storageBytes * 2 ? 'High' : 'Medium',
      impact: 'Low',
      confidence: 0.82,
      detectedBy: 'large-storage-usage',
      metric: 'storageBytes',
      currentValue: total,
      recommendedValue: ANALYSIS_THRESHOLDS.storageBytes,
      estimatedImprovement: 'Reduce client-side storage volume',
      estimatedTimeToFix: '30 minutes',
      affectedResources: [
        ...audit.storage.localStorage.keys.slice(0, 5),
        ...audit.storage.sessionStorage.keys.slice(0, 5),
      ],
      documentationLinks: ['https://developer.mozilla.org/en-US/docs/Web/API/Storage_API'],
      tags: ['storage', 'localStorage'],
    });
  },
};

export const tooManyCookiesRule: AnalysisRule = {
  id: 'too-many-cookies',
  detect(audit: AuditResult) {
    const count = audit.storage.cookies.count;
    if (count < ANALYSIS_THRESHOLDS.cookieCount) {
      return null;
    }

    return createIssue({
      id: 'too-many-cookies',
      title: 'High cookie count',
      description: `${count} cookies are present on the document.`,
      category: 'Storage',
      subcategory: 'Cookies',
      severity: count > ANALYSIS_THRESHOLDS.cookieCount * 2 ? 'Medium' : 'Low',
      impact: 'Low',
      confidence: 0.88,
      detectedBy: 'too-many-cookies',
      metric: 'cookieCount',
      currentValue: count,
      recommendedValue: ANALYSIS_THRESHOLDS.cookieCount,
      estimatedImprovement: 'Reduce cookie overhead on requests',
      estimatedTimeToFix: '30 minutes',
      affectedResources: audit.storage.cookies.names.slice(0, 10),
      documentationLinks: ['https://web.dev/articles/reduce-network-payloads-using-webpack'],
      tags: ['storage', 'cookies'],
    });
  },
};
