import { action, type FixStrategy } from '@features/fix-planner/strategies/shared';

export const networkStrategies: Record<string, FixStrategy> = {
  'large-transfer-size': (ctx) => [
    action(ctx, {
      id: `${ctx.issue.id}-compress-assets`,
      title: 'Enable Brotli or Gzip compression for text assets',
      groupId: 'reduce-transfer-size',
      implementationType: 'Server Configuration',
      estimatedTime: '30 minutes',
      complexity: 'Medium',
    }),
    action(ctx, {
      id: `${ctx.issue.id}-trim-payload`,
      title: 'Trim unused assets from initial payload',
      groupId: 'reduce-transfer-size',
      implementationType: 'Asset Pipeline',
      estimatedTime: '1 hour',
    }),
  ],
  'slow-resources': (ctx) => [
    action(ctx, {
      id: `${ctx.issue.id}-cache-static`,
      title: 'Set long-cache headers on static assets',
      groupId: 'improve-resource-timing',
      implementationType: 'Server Configuration',
      estimatedTime: '30 minutes',
    }),
    action(ctx, {
      id: `${ctx.issue.id}-cdn-edge`,
      title: 'Serve slow resources from CDN edge',
      groupId: 'improve-resource-timing',
      implementationType: 'CDN',
      estimatedTime: '1 hour',
      complexity: 'Medium',
    }),
  ],
  'too-many-third-party-requests': (ctx) => [
    action(ctx, {
      id: `${ctx.issue.id}-audit-vendors`,
      title: 'Audit and remove non-essential third-party tags',
      groupId: 'control-third-party',
      implementationType: 'JavaScript',
      estimatedTime: '1 hour',
      manualVerification: true,
    }),
    action(ctx, {
      id: `${ctx.issue.id}-delay-tags`,
      title: 'Delay third-party tag loading after interaction',
      groupId: 'control-third-party',
      implementationType: 'JavaScript',
      estimatedTime: '1 hour',
      complexity: 'Medium',
    }),
  ],
};
