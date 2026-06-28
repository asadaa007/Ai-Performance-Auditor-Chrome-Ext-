import type { ReactNode } from 'react';

interface SectionProps {
  title: string;
  description?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}

export function Section({ title, description, action, children, className = '' }: SectionProps) {
  return (
    <section className={`space-y-4 ${className}`}>
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h2 className="text-sm font-semibold tracking-tight text-auditor-text">{title}</h2>
          {description && (
            <p className="mt-1 text-xs leading-relaxed text-auditor-muted">{description}</p>
          )}
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}
