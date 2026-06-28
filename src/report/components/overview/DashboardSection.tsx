import type { ReactNode } from 'react';
import { NavIcon, type NavIconName } from '@shared/components/NavIcon';

interface DashboardSectionProps {
  icon: NavIconName;
  title: string;
  subtitle?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}

export function DashboardSection({
  icon,
  title,
  subtitle,
  action,
  children,
  className = '',
}: DashboardSectionProps) {
  return (
    <section className={`space-y-4 ${className}`}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-auditor-border-subtle bg-auditor-bg-elevated">
            <NavIcon name={icon} size={18} className="text-auditor-accent" />
          </div>
          <div>
            <h2 className="text-sm font-semibold tracking-tight text-auditor-text">{title}</h2>
            {subtitle && (
              <p className="mt-0.5 max-w-3xl text-2xs leading-relaxed text-auditor-muted">
                {subtitle}
              </p>
            )}
          </div>
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}
