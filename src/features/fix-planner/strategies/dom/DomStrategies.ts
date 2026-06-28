import { action, type FixStrategy } from '@features/fix-planner/strategies/shared';

export const domStrategies: Record<string, FixStrategy> = {
  'too-many-dom-nodes': (ctx) => [
    action(ctx, {
      id: `${ctx.issue.id}-prune`,
      title: 'Prune non-essential DOM nodes',
      groupId: 'reduce-dom-weight',
      implementationType: 'HTML',
      estimatedTime: '1 hour',
      complexity: 'Medium',
    }),
    action(ctx, {
      id: `${ctx.issue.id}-virtualize`,
      title: 'Virtualize long lists and repeated blocks',
      groupId: 'reduce-dom-weight',
      implementationType: 'JavaScript',
      frameworkSpecific: Boolean(ctx.profile.uiLibrary),
      estimatedTime: 'Several hours',
      complexity: 'Hard',
    }),
  ],
  'large-dom-depth': (ctx) => [
    action(ctx, {
      id: `${ctx.issue.id}-flatten`,
      title: 'Flatten deeply nested layout wrappers',
      groupId: 'reduce-dom-weight',
      implementationType: 'HTML',
      estimatedTime: '1 hour',
      complexity: 'Medium',
    }),
    action(ctx, {
      id: `${ctx.issue.id}-component-boundaries`,
      title: 'Split deep trees into smaller component boundaries',
      groupId: 'reduce-dom-weight',
      implementationType: 'JavaScript',
      frameworkSpecific: Boolean(ctx.profile.uiLibrary),
      estimatedTime: 'Several hours',
      complexity: 'Hard',
    }),
  ],
};
