import { motion } from 'framer-motion';
import type { ReactNode } from 'react';
import { Card } from './Card';

type Tone = 'success' | 'warning' | 'danger' | 'neutral' | 'accent';

interface BadgeProps {
  children: ReactNode;
  tone?: Tone;
  className?: string;
}

const toneClasses: Record<Tone, string> = {
  success: 'bg-auditor-success-muted text-auditor-success border-auditor-success/20',
  warning: 'bg-auditor-warning-muted text-auditor-warning border-auditor-warning/20',
  danger: 'bg-auditor-danger-muted text-auditor-danger border-auditor-danger/20',
  neutral: 'bg-auditor-surface-hover text-auditor-muted-foreground border-auditor-border',
  accent: 'bg-auditor-accent-muted text-auditor-accent border-auditor-accent/20',
};

export function Badge({ children, tone = 'neutral', className = '' }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-md border px-1.5 py-0.5 text-2xs font-medium uppercase tracking-wide ${toneClasses[tone]} ${className}`}
    >
      {children}
    </span>
  );
}

interface StatusPillProps {
  label: string;
  tone?: Tone;
}

export function StatusPill({ label, tone = 'neutral' }: StatusPillProps) {
  const dotColor = {
    success: 'bg-auditor-success',
    warning: 'bg-auditor-warning',
    danger: 'bg-auditor-danger',
    neutral: 'bg-auditor-muted',
    accent: 'bg-auditor-accent',
  }[tone];

  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-auditor-border-subtle bg-auditor-bg-elevated px-2 py-0.5 text-2xs text-auditor-muted-foreground">
      <span className={`h-1.5 w-1.5 rounded-full ${dotColor}`} />
      {label}
    </span>
  );
}

interface MetricCardProps {
  label: string;
  value: string;
  unit?: string;
  description?: string;
}

export function MetricCard({ label, value, unit, description }: MetricCardProps) {
  return (
    <Card padding="sm" className="space-y-2">
      <p className="text-xs text-auditor-muted">{label}</p>
      <div className="flex items-baseline gap-1">
        <motion.span
          key={value}
          initial={{ opacity: 0.6 }}
          animate={{ opacity: 1 }}
          className="text-xl font-semibold tracking-tight text-auditor-text"
        >
          {value}
        </motion.span>
        {unit && <span className="text-xs text-auditor-muted">{unit}</span>}
      </div>
      {description && <p className="text-2xs leading-relaxed text-auditor-muted">{description}</p>}
    </Card>
  );
}
