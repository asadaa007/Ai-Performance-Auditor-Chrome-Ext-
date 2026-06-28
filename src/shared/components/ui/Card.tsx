import type { HTMLAttributes, ReactNode } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  variant?: 'default' | 'glass' | 'elevated';
  padding?: 'sm' | 'md' | 'lg';
}

const paddingClasses = {
  sm: 'p-3',
  md: 'p-4',
  lg: 'p-5',
};

export function Card({
  children,
  variant = 'default',
  padding = 'md',
  className = '',
  ...props
}: CardProps) {
  const variantClasses =
    variant === 'glass'
      ? 'glass-panel'
      : variant === 'elevated'
        ? 'border border-auditor-border-subtle bg-auditor-bg-elevated shadow-card'
        : 'border border-auditor-border-subtle bg-auditor-surface shadow-card';

  return (
    <div
      className={`rounded-xl transition-shadow duration-fast hover:shadow-glow-sm ${variantClasses} ${paddingClasses[padding]} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
