import { action, type FixStrategy } from '@features/fix-planner/strategies/shared';

export const cssStrategies: Record<string, FixStrategy> = {
  'too-many-stylesheets': (ctx) => [
    action(ctx, {
      id: `${ctx.issue.id}-bundle`,
      title: 'Bundle stylesheets into fewer requests',
      groupId: 'optimize-css-delivery',
      implementationType: 'Build Configuration',
      estimatedTime: '1 hour',
      complexity: 'Medium',
    }),
    action(ctx, {
      id: `${ctx.issue.id}-purge`,
      title: 'Remove unused CSS rules',
      groupId: 'optimize-css-delivery',
      implementationType: 'Asset Pipeline',
      estimatedTime: '1 hour',
    }),
    action(ctx, {
      id: `${ctx.issue.id}-critical-css`,
      title: 'Extract and inline critical CSS',
      groupId: 'optimize-css-delivery',
      implementationType: 'CSS',
      estimatedTime: 'Several hours',
      complexity: 'Hard',
    }),
  ],
  'duplicate-css': (ctx) => [
    action(ctx, {
      id: `${ctx.issue.id}-dedupe`,
      title: 'Deduplicate identical stylesheet requests',
      groupId: 'optimize-css-delivery',
      implementationType: 'Asset Pipeline',
      estimatedTime: '30 minutes',
    }),
    action(ctx, {
      id: `${ctx.issue.id}-shared-chunk`,
      title: 'Move shared CSS into a single cached chunk',
      groupId: 'optimize-css-delivery',
      implementationType: 'Build Configuration',
      estimatedTime: '1 hour',
    }),
  ],
};
