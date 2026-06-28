import type { AuditResult } from '@shared/types';
import type { AnalysisResult } from '@features/analysis';
import { formatTimestamp } from '@shared/utils';

function downloadFile(filename: string, content: string, mime: string): void {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

export function exportAuditJson(result: AuditResult, analysis: AnalysisResult | null): void {
  const payload = {
    exportedAt: Date.now(),
    audit: result,
    analysis,
  };
  downloadFile(
    `audit-${sanitizeFilename(result.meta.url)}.json`,
    JSON.stringify(payload, null, 2),
    'application/json',
  );
}

export function exportAuditMarkdown(result: AuditResult, analysis: AnalysisResult | null): void {
  const lines = [
    `# Audit Report`,
    ``,
    `**URL:** ${result.meta.url}`,
    `**Collected:** ${formatTimestamp(result.meta.collectedAt)}`,
    ``,
  ];

  if (analysis) {
    lines.push(`## Summary`, ``, `- Issues: ${analysis.issueCount}`, `- Rules: ${analysis.rulesExecuted}`, ``);
    lines.push(`## Issues`, ``);
    for (const issue of analysis.issues) {
      lines.push(
        `### ${issue.title}`,
        `- Severity: ${issue.severity}`,
        `- Impact: ${issue.impact}`,
        `- Category: ${issue.category}`,
        `- Effort: ${issue.estimatedTimeToFix}`,
        issue.estimatedImprovement ? `- Score gain: ${issue.estimatedImprovement}` : '',
        issue.description,
        ``,
      );
    }
  }

  downloadFile(
    `audit-${sanitizeFilename(result.meta.url)}.md`,
    lines.filter(Boolean).join('\n'),
    'text/markdown',
  );
}

export function exportAuditPdf(): void {
  window.print();
}

function sanitizeFilename(url: string): string {
  try {
    const hostname = new URL(url).hostname.replace(/\./g, '-');
    return hostname || 'page';
  } catch {
    return 'page';
  }
}
