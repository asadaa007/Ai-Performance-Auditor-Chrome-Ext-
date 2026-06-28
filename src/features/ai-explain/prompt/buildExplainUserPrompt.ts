import type { ExplainPromptContext } from '@features/ai-explain/types';

export const EXPLAIN_MARKDOWN_SECTIONS = [
  '# Summary',
  '# Why this matters',
  '# Root Cause',
  '# Recommended Solution',
  '# Implementation Steps',
  '# Code Example',
  '# Expected Improvement',
  '# Risks / Things to Watch',
  '# References',
] as const;

export function buildExplainUserPrompt(context: ExplainPromptContext): string {
  const profile = context.frameworkProfile;
  const issue = context.issue;
  const action = context.fixAction;
  const group = context.fixGroup;

  return [
    '## Site',
    `URL: ${context.siteUrl}`,
    '',
    '## Framework profile',
    `Primary framework: ${profile.primaryFramework}`,
    `Secondary technologies: ${profile.secondaryTechnologies.join(', ') || 'none'}`,
    `Build tool: ${profile.buildTool ?? 'unknown'}`,
    `CMS: ${profile.cms ?? 'none'}`,
    `UI library: ${profile.uiLibrary ?? 'none'}`,
    `CSS framework: ${profile.cssFramework ?? 'none'}`,
    `Analytics: ${profile.analyticsProviders.join(', ') || 'none'}`,
    `Hosting hints: ${profile.hostingHints.join(', ') || 'none'}`,
    `Detection confidence: ${Math.round(profile.confidence * 100)}%`,
    '',
    '## Selected performance issue',
    `ID: ${issue.id}`,
    `Title: ${issue.title}`,
    `Category: ${issue.category}`,
    `Severity: ${issue.severity}`,
    `Impact: ${issue.impact}`,
    `Metric: ${issue.metric}`,
    `Current value: ${issue.currentValue ?? 'n/a'}`,
    `Reference value: ${issue.recommendedValue ?? 'n/a'}`,
    `Description: ${issue.description}`,
    '',
    '## Selected fix action',
    `Title: ${action.title}`,
    `Category: ${action.category}`,
    `Priority: ${action.priority}`,
    `Complexity: ${action.complexity}`,
    `Estimated time: ${action.estimatedTime}`,
    `Estimated impact: ${action.estimatedImpact}`,
    `Implementation type: ${action.implementationType}`,
    `Requires developer: ${action.requiresDeveloper ? 'yes' : 'no'}`,
    action.dependsOn.length > 0 ? `Depends on: ${action.dependsOn.join(', ')}` : 'Depends on: none',
    '',
    '## Related fix group',
    `Title: ${group.title}`,
    `Description: ${group.description}`,
    `Group priority: ${group.priority}`,
    `Group impact: ${group.estimatedImpact}`,
    `Group complexity: ${group.complexity}`,
    '',
    '## Relevant audit metrics',
    ...context.relevantMetrics.map((metric) => `- ${metric.label}: ${metric.value}`),
    '',
    '## Relevant resources',
    ...(context.relevantResources.length > 0
      ? context.relevantResources.map((resource) => `- ${resource}`)
      : ['- none listed']),
    '',
    '## Response format',
    'Respond in Markdown using exactly these sections:',
    ...EXPLAIN_MARKDOWN_SECTIONS.map((section) => `- ${section}`),
    '',
    'Tailor the Code Example to the detected framework. If the framework is unknown, use plain HTML/CSS/JavaScript.',
    'Ground all claims in the supplied metrics and resources. Do not invent measurements.',
  ].join('\n');
}
