import type { PromptContext } from '@features/ai/types/request';

export function buildUserPrompt(context: PromptContext): string {
  const sections: string[] = [
    '## Site',
    `URL: ${context.siteUrl}`,
    `Collected: ${context.collectedAt}`,
    `Collection duration: ${context.collectionDurationMs} ms`,
    '',
    '## Key metrics',
    ...context.keyMetrics.map((metric) => `- ${metric.label}: ${metric.value}`),
  ];

  if (context.topIssues.length > 0) {
    sections.push('', '## Top issues');
    for (const issue of context.topIssues) {
      sections.push(`- [${issue.severity}/${issue.impact}] ${issue.title} (${issue.category})`);
      if (issue.affectedResources.length > 0) {
        sections.push(`  Resources: ${issue.affectedResources.join(', ')}`);
      }
    }
  }

  if (context.selectedIssue) {
    const issue = context.selectedIssue;
    sections.push(
      '',
      '## Selected issue',
      `Title: ${issue.title}`,
      `Severity: ${issue.severity}`,
      `Impact: ${issue.impact}`,
      `Metric: ${issue.metric}`,
      `Current value: ${issue.currentValue ?? 'n/a'}`,
      `Description: ${issue.description}`,
    );
    if (issue.affectedResources.length > 0) {
      sections.push(`Resources: ${issue.affectedResources.join(', ')}`);
    }
  }

  if (context.metaSummary) {
    sections.push(
      '',
      '## Metadata',
      `Title: ${context.metaSummary.title ?? 'missing'}`,
      `Description: ${context.metaSummary.description ?? 'missing'}`,
      `Canonical: ${context.metaSummary.canonical ?? 'missing'}`,
      `Robots: ${context.metaSummary.robots ?? 'missing'}`,
    );
  }

  return sections.join('\n');
}
