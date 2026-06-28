import { action, type FixStrategy } from '@features/fix-planner/strategies/shared';

export const accessibilityStrategies: Record<string, FixStrategy> = {
  'missing-lang': (ctx) => [
    action(ctx, {
      id: `${ctx.issue.id}-html-lang`,
      title: 'Set lang attribute on html element',
      groupId: 'improve-accessibility',
      implementationType: 'HTML',
      estimatedTime: '5 minutes',
      complexity: 'Very Easy',
      requiresDeveloper: false,
      estimatedImpact: 'Low',
    }),
  ],
  'missing-alt-text': (ctx) => [
    action(ctx, {
      id: `${ctx.issue.id}-alt-attributes`,
      title: 'Add alt text to informative images',
      groupId: 'improve-accessibility',
      implementationType: 'HTML',
      estimatedTime: '30 minutes',
      complexity: 'Easy',
      requiresDeveloper: false,
      estimatedImpact: 'Medium',
    }),
    action(ctx, {
      id: `${ctx.issue.id}-decorative-alt`,
      title: 'Mark decorative images with empty alt',
      groupId: 'improve-accessibility',
      implementationType: 'HTML',
      estimatedTime: '15 minutes',
      complexity: 'Easy',
      requiresDeveloper: false,
    }),
  ],
  'missing-form-labels': (ctx) => [
    action(ctx, {
      id: `${ctx.issue.id}-associate-labels`,
      title: 'Associate labels with form controls',
      groupId: 'improve-accessibility',
      implementationType: 'HTML',
      estimatedTime: '30 minutes',
      complexity: 'Easy',
      requiresDeveloper: false,
      estimatedImpact: 'Medium',
    }),
    action(ctx, {
      id: `${ctx.issue.id}-aria-labels`,
      title: 'Add aria-label where visible labels are not possible',
      groupId: 'improve-accessibility',
      implementationType: 'HTML',
      estimatedTime: '30 minutes',
      complexity: 'Medium',
    }),
  ],
};
