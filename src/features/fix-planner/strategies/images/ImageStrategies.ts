import { action, type FixStrategy } from '@features/fix-planner/strategies/shared';

export const imageStrategies: Record<string, FixStrategy> = {
  'large-images': (ctx) => [
    action(ctx, {
      id: `${ctx.issue.id}-convert-avif`,
      title: 'Convert oversized images to AVIF',
      groupId: 'optimize-hero-images',
      implementationType: 'Image Optimization',
      estimatedImpact: 'High',
      estimatedTime: '30 minutes',
    }),
    action(ctx, {
      id: `${ctx.issue.id}-compress`,
      title: 'Compress image assets to target byte budget',
      groupId: 'optimize-hero-images',
      implementationType: 'Image Optimization',
      dependsOn: [`${ctx.issue.id}-convert-avif`],
      estimatedTime: '30 minutes',
    }),
    action(ctx, {
      id: `${ctx.issue.id}-responsive-srcset`,
      title: 'Add responsive srcset for large images',
      groupId: 'optimize-hero-images',
      implementationType: 'HTML',
      estimatedTime: '30 minutes',
      complexity: 'Medium',
    }),
  ],
  'missing-lazy-load': (ctx) => [
    action(ctx, {
      id: `${ctx.issue.id}-lazy-attribute`,
      title: 'Add loading="lazy" to below-the-fold images',
      groupId: 'optimize-image-delivery',
      implementationType: 'HTML',
      estimatedTime: '15 minutes',
      complexity: 'Very Easy',
      requiresDeveloper: false,
    }),
    action(ctx, {
      id: `${ctx.issue.id}-defer-offscreen`,
      title: 'Defer offscreen image requests',
      groupId: 'optimize-image-delivery',
      implementationType: 'JavaScript',
      estimatedTime: '30 minutes',
    }),
  ],
  'missing-image-dimensions': (ctx) => [
    action(ctx, {
      id: `${ctx.issue.id}-width-height`,
      title: 'Set explicit width and height on images',
      groupId: 'stabilize-layout',
      implementationType: 'HTML',
      estimatedTime: '15 minutes',
      complexity: 'Easy',
      requiresDeveloper: false,
    }),
    action(ctx, {
      id: `${ctx.issue.id}-aspect-ratio`,
      title: 'Apply aspect-ratio CSS for responsive images',
      groupId: 'stabilize-layout',
      implementationType: 'CSS',
      estimatedTime: '30 minutes',
    }),
  ],
};
