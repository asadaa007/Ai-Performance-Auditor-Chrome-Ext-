import type { AnalysisResult } from '@features/analysis';
import { AI_LIMITS } from '@features/ai/types/config';
import type { PromptContext } from '@features/ai/types/request';
import type { AuditResult } from '@shared/types';
import { displayValue, formatBytes, formatNumber, formatTimestamp } from '@shared/utils';

export class ContextBuilder {
  build(
    audit: AuditResult,
    analysis: AnalysisResult,
    selectedIssueId?: string,
    maxIssues: number = AI_LIMITS.maxIssuesInContext,
  ): PromptContext {
    const selectedIssue = selectedIssueId
      ? analysis.issues.find((issue) => issue.id === selectedIssueId)
      : undefined;

    const topIssues = analysis.issues.slice(0, maxIssues).map((issue) => ({
      id: issue.id,
      title: issue.title,
      severity: issue.severity,
      impact: issue.impact,
      category: issue.category,
      affectedResources: issue.affectedResources.slice(0, AI_LIMITS.maxResourcesPerIssue),
    }));

    const metaSummary =
      this.needsMetaContext(analysis) || selectedIssue?.category === 'SEO'
        ? {
            title: audit.metaTags.title,
            description: audit.metaTags.description,
            canonical: audit.metaTags.canonicalUrl,
            robots: audit.metaTags.robots,
          }
        : undefined;

    return {
      siteUrl: audit.meta.url,
      collectedAt: formatTimestamp(audit.meta.collectedAt),
      collectionDurationMs: audit.meta.collectionDurationMs,
      keyMetrics: this.buildKeyMetrics(audit),
      topIssues,
      selectedIssue: selectedIssue
        ? {
            id: selectedIssue.id,
            title: selectedIssue.title,
            severity: selectedIssue.severity,
            impact: selectedIssue.impact,
            description: selectedIssue.description,
            metric: selectedIssue.metric,
            currentValue: selectedIssue.currentValue,
            affectedResources: selectedIssue.affectedResources.slice(
              0,
              AI_LIMITS.maxResourcesPerIssue,
            ),
          }
        : undefined,
      metaSummary,
    };
  }

  private buildKeyMetrics(audit: AuditResult) {
    return [
      { label: 'LCP', value: displayValue(audit.webVitals.lcp) },
      { label: 'CLS', value: displayValue(audit.webVitals.cls) },
      { label: 'INP', value: displayValue(audit.webVitals.inp) },
      { label: 'FCP', value: displayValue(audit.webVitals.fcp) },
      { label: 'TTFB', value: displayValue(audit.webVitals.ttfb) },
      { label: 'Resources', value: formatNumber(audit.resources.totalRequests) },
      { label: 'Transfer', value: formatBytes(audit.resources.totalTransferSize) },
      { label: 'DOM nodes', value: formatNumber(audit.dom.totalNodes) },
      { label: 'Scripts', value: formatNumber(audit.javascript.totalScripts) },
      { label: 'Images', value: formatNumber(audit.images.totalImages) },
    ];
  }

  private needsMetaContext(analysis: AnalysisResult): boolean {
    return analysis.issues.some((issue) => issue.category === 'SEO');
  }
}

export const contextBuilder = new ContextBuilder();
