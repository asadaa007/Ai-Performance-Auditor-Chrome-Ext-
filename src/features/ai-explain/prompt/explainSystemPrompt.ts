import type { FrameworkProfile } from '@features/fix-planner';
import type { SystemPromptTemplate } from '@features/ai/types/request';

const EXPLAIN_BASE =
  'You are an expert web performance engineer. Provide actionable explain-and-fix guidance grounded only in the supplied context. Respond directly in this conversation with Markdown using the required section headings — do not create files, branches, pull requests, or describe your plan. Include a practical code example for the detected stack. Output only the final guidance the user should read.';

export function resolveExplainTemplate(profile: FrameworkProfile): SystemPromptTemplate {
  const primary = profile.primaryFramework.toLowerCase();

  if (profile.cms === 'WordPress' || primary.includes('wordpress')) {
    return 'wordpress-optimization';
  }
  if (primary === 'next.js') {
    return 'nextjs-optimization';
  }
  if (profile.uiLibrary === 'React' || primary === 'react') {
    return 'react-optimization';
  }
  if (profile.uiLibrary === 'Vue' || primary === 'vue' || primary === 'nuxt') {
    return 'static-html-optimization';
  }
  if (profile.uiLibrary === 'Angular' || primary === 'angular') {
    return 'static-html-optimization';
  }
  if (primary === 'plain html') {
    return 'static-html-optimization';
  }

  return 'fix-single-issue';
}

export function buildExplainSystemPrompt(template: SystemPromptTemplate): string {
  const frameworkHint: Record<SystemPromptTemplate, string> = {
    'general-analysis': '',
    'fix-single-issue':
      'Use plain HTML, CSS, and JavaScript in the code example when framework specifics are unclear.',
    'explain-metric': '',
    'accessibility-review': '',
    'seo-review': '',
    'performance-review': '',
    'react-optimization':
      'Use React component patterns in the Code Example section. Prefer functional components and hooks.',
    'nextjs-optimization':
      'Use Next.js App Router or Pages Router patterns in the Code Example section as appropriate.',
    'wordpress-optimization':
      'Use WordPress theme or plugin patterns in the Code Example section (PHP where needed).',
    'static-html-optimization': 'Use plain HTML, CSS, and JavaScript in the Code Example section.',
  };

  return `${EXPLAIN_BASE} ${frameworkHint[template]}`.trim();
}
