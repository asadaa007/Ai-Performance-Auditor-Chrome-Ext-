import type { SystemPromptTemplate } from '@features/ai/types/request';

const BASE_INSTRUCTION =
  'You are an expert web performance engineer. Respond with precise, technical analysis grounded only in the supplied audit context. Do not invent metrics.';

const TEMPLATES: Record<SystemPromptTemplate, string> = {
  'general-analysis': `${BASE_INSTRUCTION} Provide a structured technical overview of the audit findings.`,
  'fix-single-issue': `${BASE_INSTRUCTION} Focus exclusively on the selected issue and its affected resources.`,
  'explain-metric': `${BASE_INSTRUCTION} Explain the supplied metric values and their measurement context.`,
  'accessibility-review': `${BASE_INSTRUCTION} Focus on accessibility-related findings and document semantics.`,
  'seo-review': `${BASE_INSTRUCTION} Focus on metadata, canonicalization, and SEO-related signals.`,
  'performance-review': `${BASE_INSTRUCTION} Focus on Web Vitals, navigation timing, and load performance signals.`,
  'react-optimization': `${BASE_INSTRUCTION} Interpret findings in the context of React client-rendered applications.`,
  'nextjs-optimization': `${BASE_INSTRUCTION} Interpret findings in the context of Next.js applications and routing.`,
  'wordpress-optimization': `${BASE_INSTRUCTION} Interpret findings in the context of WordPress themes and plugins.`,
  'static-html-optimization': `${BASE_INSTRUCTION} Interpret findings in the context of static HTML sites.`,
};

export function getSystemPrompt(template: SystemPromptTemplate): string {
  return TEMPLATES[template];
}

export function listSystemPromptTemplates(): SystemPromptTemplate[] {
  return Object.keys(TEMPLATES) as SystemPromptTemplate[];
}

export const SYSTEM_PROMPT_LABELS: Record<SystemPromptTemplate, string> = {
  'general-analysis': 'General Analysis',
  'fix-single-issue': 'Fix Single Issue',
  'explain-metric': 'Explain Metric',
  'accessibility-review': 'Accessibility Review',
  'seo-review': 'SEO Review',
  'performance-review': 'Performance Review',
  'react-optimization': 'React Optimization',
  'nextjs-optimization': 'Next.js Optimization',
  'wordpress-optimization': 'WordPress Optimization',
  'static-html-optimization': 'Static HTML Optimization',
};
