import { ANALYSIS_THRESHOLDS } from '@features/analysis/constants/thresholds';
import { createIssue } from '@features/analysis/utils/createIssue';
import type { AnalysisRule } from '@features/analysis/types';
import type { AuditResult } from '@shared/types';

export const tooManyDomNodesRule: AnalysisRule = {
  id: 'too-many-dom-nodes',
  detect(audit: AuditResult) {
    const count = audit.dom.totalNodes;
    if (count < ANALYSIS_THRESHOLDS.domNodeCount) {
      return null;
    }

    return createIssue({
      id: 'too-many-dom-nodes',
      title: 'Large DOM node count',
      description: `Document contains ${count.toLocaleString()} DOM nodes.`,
      category: 'DOM',
      subcategory: 'Node count',
      severity: count > ANALYSIS_THRESHOLDS.domNodeCount * 2 ? 'High' : 'Medium',
      impact: 'Medium',
      confidence: 0.9,
      detectedBy: 'too-many-dom-nodes',
      metric: 'totalNodes',
      currentValue: count,
      recommendedValue: ANALYSIS_THRESHOLDS.domNodeCount,
      estimatedImprovement: 'Reduce DOM size and traversal cost',
      estimatedTimeToFix: 'Several hours',
      affectedResources: [audit.meta.url],
      documentationLinks: ['https://web.dev/articles/dom-size-and-interactivity'],
      tags: ['dom', 'nodes'],
    });
  },
};

export const largeDomDepthRule: AnalysisRule = {
  id: 'large-dom-depth',
  detect(audit: AuditResult) {
    const depth = audit.dom.maxDepth;
    if (depth < ANALYSIS_THRESHOLDS.domMaxDepth) {
      return null;
    }

    return createIssue({
      id: 'large-dom-depth',
      title: 'Deep DOM nesting',
      description: `Maximum DOM depth is ${depth} levels.`,
      category: 'DOM',
      subcategory: 'Depth',
      severity: depth > ANALYSIS_THRESHOLDS.domMaxDepth + 16 ? 'High' : 'Medium',
      impact: 'Medium',
      confidence: 0.85,
      detectedBy: 'large-dom-depth',
      metric: 'maxDepth',
      currentValue: depth,
      recommendedValue: ANALYSIS_THRESHOLDS.domMaxDepth,
      estimatedImprovement: 'Flatten DOM hierarchy',
      estimatedTimeToFix: '1 hour',
      affectedResources: [audit.meta.url],
      documentationLinks: ['https://web.dev/articles/dom-size-and-interactivity'],
      tags: ['dom', 'depth'],
    });
  },
};
