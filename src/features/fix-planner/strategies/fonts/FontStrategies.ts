import { action, type FixStrategy } from '@features/fix-planner/strategies/shared';

export const fontStrategies: Record<string, FixStrategy> = {
  'too-many-fonts': (ctx) => [
    action(ctx, {
      id: `${ctx.issue.id}-subset`,
      title: 'Subset font files to used glyph ranges',
      groupId: 'optimize-font-loading',
      implementationType: 'Asset Pipeline',
      estimatedTime: '1 hour',
    }),
    action(ctx, {
      id: `${ctx.issue.id}-reduce-families`,
      title: 'Reduce active font family count',
      groupId: 'optimize-font-loading',
      implementationType: 'CSS',
      estimatedTime: '30 minutes',
      complexity: 'Easy',
    }),
  ],
  'missing-preload-fonts': (ctx) => [
    action(ctx, {
      id: `${ctx.issue.id}-preload-woff2`,
      title: 'Preload critical WOFF2 font files',
      groupId: 'optimize-font-loading',
      implementationType: 'HTML',
      estimatedTime: '15 minutes',
      complexity: 'Easy',
      requiresDeveloper: false,
    }),
    action(ctx, {
      id: `${ctx.issue.id}-font-display`,
      title: 'Set font-display strategy for web fonts',
      groupId: 'optimize-font-loading',
      implementationType: 'CSS',
      estimatedTime: '15 minutes',
      complexity: 'Very Easy',
      requiresDeveloper: false,
    }),
  ],
};
