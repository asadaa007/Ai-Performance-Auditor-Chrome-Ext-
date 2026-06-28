import { lazy, Suspense, useEffect, useMemo, useState } from 'react';
import type { Components } from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeSanitize from 'rehype-sanitize';

const ReactMarkdown = lazy(() => import('react-markdown'));

const LANGUAGE_ALIASES: Record<string, string> = {
  html: 'html',
  xml: 'html',
  css: 'css',
  js: 'javascript',
  javascript: 'javascript',
  ts: 'typescript',
  typescript: 'typescript',
  tsx: 'typescript',
  jsx: 'javascript',
  react: 'javascript',
  nextjs: 'typescript',
  php: 'php',
  json: 'json',
  bash: 'bash',
  sh: 'bash',
  shell: 'bash',
};

interface MarkdownRendererProps {
  content: string;
}

export function MarkdownRenderer({ content }: MarkdownRendererProps) {
  const [highlighter, setHighlighter] = useState<(typeof import('highlight.js'))['default'] | null>(
    null,
  );

  useEffect(() => {
    let cancelled = false;

    void Promise.all([
      import('highlight.js'),
      import('highlight.js/styles/github-dark.min.css'),
    ]).then(([module]) => {
      if (!cancelled) {
        setHighlighter(module.default);
      }
    });

    return () => {
      cancelled = true;
    };
  }, []);

  const components = useMemo<Components>(
    () => ({
      code({ className, children, ...props }) {
        const match = /language-([\w-]+)/.exec(className ?? '');
        const language = match?.[1] ? (LANGUAGE_ALIASES[match[1]] ?? match[1]) : null;
        const code = String(children).replace(/\n$/, '');

        if (language && highlighter) {
          const highlighted = highlighter.highlight(code, { language }).value;
          return (
            <pre className="overflow-x-auto rounded-lg border border-auditor-border-subtle bg-auditor-bg-elevated p-3 text-2xs">
              <code className={className} dangerouslySetInnerHTML={{ __html: highlighted }} />
            </pre>
          );
        }

        return (
          <code
            className="rounded bg-auditor-bg-elevated px-1 py-0.5 font-mono text-2xs"
            {...props}
          >
            {children}
          </code>
        );
      },
      a({ href, children }) {
        return (
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="text-auditor-accent hover:underline"
          >
            {children}
          </a>
        );
      },
    }),
    [highlighter],
  );

  return (
    <Suspense fallback={<p className="text-xs text-auditor-muted">Loading response…</p>}>
      <div className="prose prose-invert max-w-none text-xs leading-relaxed [&_h1]:text-base [&_h1]:font-semibold [&_h2]:mt-4 [&_h2]:text-sm [&_h2]:font-semibold [&_p]:text-auditor-muted-foreground [&_ul]:list-disc [&_ul]:pl-5">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          rehypePlugins={[rehypeSanitize]}
          components={components}
        >
          {content}
        </ReactMarkdown>
      </div>
    </Suspense>
  );
}
