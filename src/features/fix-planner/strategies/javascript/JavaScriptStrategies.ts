import {
  action,
  resolveImplementationType,
  type FixStrategy,
} from '@features/fix-planner/strategies/shared';

export const javascriptStrategies: Record<string, FixStrategy> = {
  'too-many-scripts': (ctx) => [
    action(ctx, {
      id: `${ctx.issue.id}-bundle`,
      title: 'Bundle and tree-shake JavaScript modules',
      groupId: 'reduce-javascript-payload',
      implementationType: 'Build Configuration',
      estimatedTime: 'Several hours',
      complexity: 'Hard',
    }),
    action(ctx, {
      id: `${ctx.issue.id}-defer`,
      title: 'Defer non-critical script execution',
      groupId: 'reduce-javascript-payload',
      implementationType: 'HTML',
      estimatedTime: '30 minutes',
    }),
    action(ctx, {
      id: `${ctx.issue.id}-code-split`,
      title: 'Code-split routes and heavy components',
      groupId: 'reduce-javascript-payload',
      implementationType: resolveImplementationType(ctx.profile, 'JavaScript'),
      frameworkSpecific: Boolean(ctx.profile.uiLibrary),
      estimatedTime: 'Several hours',
      complexity: 'Expert',
    }),
  ],
  'duplicate-js': (ctx) => [
    action(ctx, {
      id: `${ctx.issue.id}-dedupe`,
      title: 'Remove duplicate JavaScript bundles',
      groupId: 'reduce-javascript-payload',
      implementationType: 'Build Configuration',
      estimatedTime: '1 hour',
    }),
    action(ctx, {
      id: `${ctx.issue.id}-shared-vendor`,
      title: 'Consolidate shared vendor libraries',
      groupId: 'reduce-javascript-payload',
      implementationType: 'Asset Pipeline',
      estimatedTime: '1 hour',
      complexity: 'Medium',
    }),
  ],
};
