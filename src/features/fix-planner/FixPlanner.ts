import { maxComplexity, maxImpact, maxPriority } from '@features/fix-planner/ComplexityEstimator';
import { dependencyResolver } from '@features/fix-planner/DependencyResolver';
import { fixStrategyEngine } from '@features/fix-planner/FixStrategyEngine';
import { frameworkDetector } from '@features/fix-planner/FrameworkDetector';
import type { FixActionDraft } from '@features/fix-planner/strategies/shared';
import type { FixGroup, FixPlan } from '@features/fix-planner/types';
import type { AnalysisResult } from '@features/analysis';
import type { AuditResult } from '@shared/types';

const GROUP_DEFINITIONS: Record<string, { title: string; description: string }> = {
  'optimize-hero-images': {
    title: 'Optimize Hero Images',
    description: 'Modern formats, responsive delivery, and LCP preload sequencing',
  },
  'optimize-image-delivery': {
    title: 'Optimize Image Delivery',
    description: 'Lazy loading and deferred offscreen image requests',
  },
  'optimize-lcp': {
    title: 'Improve Largest Contentful Paint',
    description: 'LCP identification and server response improvements',
  },
  'stabilize-layout': {
    title: 'Stabilize Layout',
    description: 'Reserve space and reduce layout shift sources',
  },
  'improve-interactivity': {
    title: 'Improve Interactivity',
    description: 'Reduce main-thread work and defer third-party scripts',
  },
  'accelerate-first-paint': {
    title: 'Accelerate First Paint',
    description: 'Critical CSS and render-blocking resource deferral',
  },
  'reduce-server-latency': {
    title: 'Reduce Server Latency',
    description: 'HTML caching and CDN origin improvements',
  },
  'optimize-css-delivery': {
    title: 'Optimize CSS Delivery',
    description: 'Bundle, purge, and inline critical styles',
  },
  'reduce-javascript-payload': {
    title: 'Reduce JavaScript Payload',
    description: 'Bundle deduplication, deferral, and code splitting',
  },
  'optimize-font-loading': {
    title: 'Optimize Font Loading',
    description: 'Preload, subset, and reduce web font overhead',
  },
  'reduce-dom-weight': {
    title: 'Reduce DOM Weight',
    description: 'Prune nodes and flatten deep component trees',
  },
  'improve-metadata': {
    title: 'Improve Metadata',
    description: 'Title, description, and canonical tag coverage',
  },
  'improve-accessibility': {
    title: 'Improve Accessibility',
    description: 'Language, alt text, and form labeling fixes',
  },
  'reduce-transfer-size': {
    title: 'Reduce Transfer Size',
    description: 'Compression and payload trimming',
  },
  'improve-resource-timing': {
    title: 'Improve Resource Timing',
    description: 'Caching and CDN delivery for slow resources',
  },
  'control-third-party': {
    title: 'Control Third-Party Tags',
    description: 'Audit and delay non-essential vendor scripts',
  },
  'optimize-client-storage': {
    title: 'Optimize Client Storage',
    description: 'Storage budgets and cookie scope reduction',
  },
};

const GROUP_PRIORITY: string[] = [
  'optimize-hero-images',
  'optimize-lcp',
  'reduce-javascript-payload',
  'optimize-css-delivery',
  'improve-interactivity',
  'stabilize-layout',
  'accelerate-first-paint',
  'reduce-server-latency',
  'optimize-image-delivery',
  'optimize-font-loading',
  'reduce-transfer-size',
  'improve-resource-timing',
  'control-third-party',
  'reduce-dom-weight',
  'improve-metadata',
  'improve-accessibility',
  'optimize-client-storage',
];

export class FixPlanner {
  plan(audit: AuditResult, analysis: AnalysisResult): FixPlan {
    const frameworkProfile = frameworkDetector.detect(audit);
    const drafts = fixStrategyEngine.generateActions(analysis, audit, frameworkProfile);
    const { actions: orderedActions, unresolvedDependencies } = dependencyResolver.resolve(
      fixStrategyEngine.toFixActions(drafts),
    );

    const draftById = new Map(drafts.map((draft) => [draft.id, draft]));
    const groups = this.buildGroups(orderedActions, draftById, frameworkProfile.primaryFramework);

    return {
      generatedAt: Date.now(),
      auditUrl: analysis.auditUrl,
      frameworkProfile,
      actionCount: orderedActions.length,
      groupCount: groups.length,
      groups,
      actions: orderedActions,
      unresolvedDependencies,
    };
  }

  private buildGroups(
    actions: import('@features/fix-planner/types').FixAction[],
    draftById: Map<string, FixActionDraft>,
    framework: string,
  ): FixGroup[] {
    const grouped = new Map<string, import('@features/fix-planner/types').FixAction[]>();

    for (const action of actions) {
      const groupId = draftById.get(action.id)?.groupId ?? 'misc';
      const bucket = grouped.get(groupId) ?? [];
      bucket.push(action);
      grouped.set(groupId, bucket);
    }

    const groups: FixGroup[] = [];

    for (const [groupId, groupActions] of grouped.entries()) {
      const definition = GROUP_DEFINITIONS[groupId] ?? {
        title: groupId.replace(/-/g, ' '),
        description: 'Related fix actions grouped by impact area',
      };

      const sortedActions = dependencyResolver.sortWithinGroup(groupActions);
      const resources = [
        ...new Set(sortedActions.flatMap((action) => action.affectedResources)),
      ].slice(0, 6);

      groups.push({
        id: groupId,
        title: definition.title,
        description: definition.description,
        priority: maxPriority(sortedActions.map((action) => action.priority)),
        estimatedImpact: maxImpact(sortedActions.map((action) => action.estimatedImpact)),
        complexity: maxComplexity(sortedActions.map((action) => action.complexity)),
        framework,
        affectedResources: resources,
        actions: sortedActions,
      });
    }

    return groups.sort((a, b) => {
      const aIndex = GROUP_PRIORITY.indexOf(a.id);
      const bIndex = GROUP_PRIORITY.indexOf(b.id);
      const safeA = aIndex === -1 ? Number.MAX_SAFE_INTEGER : aIndex;
      const safeB = bIndex === -1 ? Number.MAX_SAFE_INTEGER : bIndex;
      if (safeA !== safeB) {
        return safeA - safeB;
      }
      return a.title.localeCompare(b.title);
    });
  }
}

export const fixPlanner = new FixPlanner();
