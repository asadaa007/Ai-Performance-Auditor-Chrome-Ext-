import type { ButtonHTMLAttributes, ReactNode } from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
type ButtonSize = 'sm' | 'md';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    'bg-gradient-to-r from-auditor-accent-deep to-auditor-accent text-white hover:from-auditor-accent hover:to-auditor-accent-hover shadow-glow-sm focus-visible:ring-auditor-accent active:scale-[0.98]',
  secondary:
    'border border-auditor-border bg-auditor-surface text-auditor-text hover:bg-auditor-surface-hover hover:border-auditor-border-subtle focus-visible:ring-auditor-accent',
  ghost:
    'text-auditor-muted-foreground hover:bg-auditor-surface hover:text-auditor-text focus-visible:ring-auditor-accent',
  danger:
    'border border-auditor-danger/30 bg-auditor-danger-muted text-auditor-danger hover:bg-auditor-danger/20 focus-visible:ring-auditor-danger',
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'h-7 px-2.5 text-xs rounded-lg',
  md: 'h-9 px-4 text-sm rounded-lg',
};

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  type = 'button',
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={`inline-flex items-center justify-center gap-1.5 font-medium transition-colors duration-fast focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-auditor-bg disabled:pointer-events-none disabled:opacity-40 ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
