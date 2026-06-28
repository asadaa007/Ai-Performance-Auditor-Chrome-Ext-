import {
  action,
  resolveImplementationType,
  type FixStrategy,
} from '@features/fix-planner/strategies/shared';

export const seoStrategies: Record<string, FixStrategy> = {
  'missing-title': (ctx) => [
    action(ctx, {
      id: `${ctx.issue.id}-add-title`,
      title: 'Add unique document title element',
      groupId: 'improve-metadata',
      implementationType: resolveImplementationType(ctx.profile, 'HTML', {
        wordpress: 'WordPress Theme',
        'next.js': 'Next.js',
      }),
      estimatedTime: '5 minutes',
      complexity: 'Very Easy',
      requiresDeveloper: false,
      estimatedImpact: 'Medium',
    }),
  ],
  'missing-meta-description': (ctx) => [
    action(ctx, {
      id: `${ctx.issue.id}-add-description`,
      title: 'Add meta description tag',
      groupId: 'improve-metadata',
      implementationType: resolveImplementationType(ctx.profile, 'HTML', {
        wordpress: 'WordPress Theme',
        'next.js': 'Next.js',
      }),
      estimatedTime: '15 minutes',
      complexity: 'Easy',
      requiresDeveloper: false,
      estimatedImpact: 'Medium',
    }),
  ],
  'missing-canonical': (ctx) => [
    action(ctx, {
      id: `${ctx.issue.id}-add-canonical`,
      title: 'Add canonical link element',
      groupId: 'improve-metadata',
      implementationType: resolveImplementationType(ctx.profile, 'HTML', {
        wordpress: 'WordPress Plugin',
        'next.js': 'Next.js',
      }),
      estimatedTime: '15 minutes',
      complexity: 'Easy',
      estimatedImpact: 'Medium',
    }),
  ],
};
