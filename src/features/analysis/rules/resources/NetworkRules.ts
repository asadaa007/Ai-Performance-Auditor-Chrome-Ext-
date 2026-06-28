import { ANALYSIS_THRESHOLDS } from '@features/analysis/constants/thresholds';
import { createIssue } from '@features/analysis/utils/createIssue';
import type { AnalysisRule } from '@features/analysis/types';
import type { AuditResult } from '@shared/types';
import { formatBytes } from '@shared/utils';

export const largeTransferSizeRule: AnalysisRule = {
  id: 'large-transfer-size',
  detect(audit: AuditResult) {
    const bytes = audit.resources.totalTransferSize;
    if (bytes < ANALYSIS_THRESHOLDS.totalTransferBytes) {
      return null;
    }

    return createIssue({
      id: 'large-transfer-size',
      title: 'Large total transfer size',
      description: `Total resource transfer size is ${formatBytes(bytes)} across ${audit.resources.totalRequests} requests.`,
      category: 'Network',
      subcategory: 'Transfer size',
      severity: bytes > ANALYSIS_THRESHOLDS.totalTransferBytes * 2 ? 'High' : 'Medium',
      impact: 'High',
      confidence: 0.88,
      detectedBy: 'large-transfer-size',
      metric: 'totalTransferSize',
      currentValue: bytes,
      recommendedValue: ANALYSIS_THRESHOLDS.totalTransferBytes,
      estimatedImprovement: 'Reduce total bytes transferred',
      estimatedTimeToFix: 'Several hours',
      affectedResources: audit.resources.jsFiles
        .concat(audit.resources.cssFiles, audit.resources.images)
        .slice(0, 10)
        .map((entry) => entry.name),
      documentationLinks: ['https://web.dev/articles/performance-budgets-101'],
      tags: ['network', 'transfer'],
    });
  },
};

export const slowResourcesRule: AnalysisRule = {
  id: 'slow-resources',
  detect(audit: AuditResult) {
    const slow = audit.resources.slowResources;
    if (slow.length < ANALYSIS_THRESHOLDS.slowResourceCount) {
      return null;
    }

    return createIssue({
      id: 'slow-resources',
      title: 'Multiple slow resources detected',
      description: `${slow.length} resources exceeded the slow resource duration threshold.`,
      category: 'Network',
      subcategory: 'Latency',
      severity: slow.length > 5 ? 'High' : 'Medium',
      impact: 'High',
      confidence: 0.9,
      detectedBy: 'slow-resources',
      metric: 'slowResourceCount',
      currentValue: slow.length,
      recommendedValue: 0,
      estimatedImprovement: 'Reduce resource load duration',
      estimatedTimeToFix: '1 hour',
      affectedResources: slow.slice(0, 10).map((entry) => entry.name),
      documentationLinks: ['https://web.dev/articles/optimize-resource-loading'],
      tags: ['network', 'slow'],
    });
  },
};

export const tooManyThirdPartyRequestsRule: AnalysisRule = {
  id: 'too-many-third-party-requests',
  detect(audit: AuditResult) {
    const count = audit.thirdParty.thirdPartyRequestCount;
    if (count < ANALYSIS_THRESHOLDS.thirdPartyRequestCount) {
      return null;
    }

    return createIssue({
      id: 'too-many-third-party-requests',
      title: 'High third-party request volume',
      description: `${count} third-party network requests detected across ${audit.thirdParty.uniqueThirdPartyDomains.length} domains.`,
      category: 'Network',
      subcategory: 'Third-party',
      severity: count > ANALYSIS_THRESHOLDS.thirdPartyRequestCount * 2 ? 'High' : 'Medium',
      impact: 'Medium',
      confidence: 0.85,
      detectedBy: 'too-many-third-party-requests',
      metric: 'thirdPartyRequestCount',
      currentValue: count,
      recommendedValue: ANALYSIS_THRESHOLDS.thirdPartyRequestCount,
      estimatedImprovement: 'Reduce third-party network overhead',
      estimatedTimeToFix: '1 hour',
      affectedResources: audit.thirdParty.detections.slice(0, 10).map((entry) => entry.url),
      documentationLinks: ['https://web.dev/articles/third-party-summary'],
      tags: ['third-party', 'network'],
    });
  },
};
