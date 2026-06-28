import { action, type FixStrategy } from '@features/fix-planner/strategies/shared';

export const bestPracticesStrategies: Record<string, FixStrategy> = {
  'large-storage-usage': (ctx) => [
    action(ctx, {
      id: `${ctx.issue.id}-prune-storage`,
      title: 'Prune stale localStorage and sessionStorage keys',
      groupId: 'optimize-client-storage',
      implementationType: 'JavaScript',
      estimatedTime: '30 minutes',
      complexity: 'Easy',
    }),
    action(ctx, {
      id: `${ctx.issue.id}-storage-budget`,
      title: 'Define client storage budget and eviction policy',
      groupId: 'optimize-client-storage',
      implementationType: 'JavaScript',
      estimatedTime: '1 hour',
      complexity: 'Medium',
    }),
  ],
  'too-many-cookies': (ctx) => [
    action(ctx, {
      id: `${ctx.issue.id}-cookie-audit`,
      title: 'Audit and remove non-essential cookies',
      groupId: 'optimize-client-storage',
      implementationType: 'Server Configuration',
      estimatedTime: '1 hour',
      manualVerification: true,
    }),
    action(ctx, {
      id: `${ctx.issue.id}-partition-cookies`,
      title: 'Partition third-party cookies and reduce scope',
      groupId: 'optimize-client-storage',
      implementationType: 'Server Configuration',
      estimatedTime: 'Several hours',
      complexity: 'Hard',
    }),
  ],
};
