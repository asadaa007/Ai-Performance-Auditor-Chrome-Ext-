import type { ReactNode } from 'react';
import { Button } from './Button';

interface EmptyStateProps {
  title: string;
  description: string;
  action?: ReactNode;
  icon?: ReactNode;
}

export function EmptyState({ title, description, action, icon }: EmptyStateProps) {
  return (
    <div
      className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-auditor-border bg-auditor-surface/40 px-6 py-14 text-center"
      role="status"
    >
      {icon && (
        <div
          className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-auditor-accent-muted text-lg text-auditor-accent"
          aria-hidden="true"
        >
          {icon}
        </div>
      )}
      <h3 className="text-sm font-semibold text-auditor-text">{title}</h3>
      <p className="mt-2 max-w-sm text-sm leading-relaxed text-auditor-muted">{description}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

interface ErrorStateProps {
  title?: string;
  message: string;
  onRetry?: () => void;
}

export function ErrorState({ title = 'Something went wrong', message, onRetry }: ErrorStateProps) {
  return (
    <div
      className="rounded-xl border border-auditor-danger/30 bg-auditor-danger-muted p-5"
      role="alert"
    >
      <h3 className="text-sm font-semibold text-auditor-danger">{title}</h3>
      <p className="mt-1.5 text-sm leading-relaxed text-auditor-muted-foreground">{message}</p>
      {onRetry && (
        <Button variant="danger" size="sm" className="mt-4" onClick={onRetry}>
          Try again
        </Button>
      )}
    </div>
  );
}

export function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`skeleton-shimmer ${className}`} aria-hidden="true" />;
}

export function SkeletonGrid({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-3" aria-busy="true" aria-label="Loading content">
      {Array.from({ length: count }).map((_, index) => (
        <Skeleton key={index} className="h-24 rounded-xl" />
      ))}
    </div>
  );
}

interface LoadingOverlayProps {
  visible: boolean;
  label?: string;
  progress?: number;
  fullscreen?: boolean;
}

export function LoadingOverlay({
  visible,
  label = 'Loading…',
  progress,
  fullscreen = false,
}: LoadingOverlayProps) {
  if (!visible) {
    return null;
  }

  return (
    <div
      role="status"
      aria-live="polite"
      aria-busy="true"
      className={
        fullscreen
          ? 'fixed inset-0 z-50 flex flex-col items-center justify-center bg-auditor-bg/90 backdrop-blur-sm'
          : 'absolute inset-0 z-20 flex flex-col items-center justify-center rounded-xl bg-auditor-bg/85 backdrop-blur-sm'
      }
    >
      <div
        className="h-9 w-9 animate-spin rounded-full border-2 border-auditor-border border-t-auditor-accent"
        aria-hidden="true"
      />
      <p className="mt-4 text-sm text-auditor-text-secondary">{label}</p>
      {progress !== undefined && (
        <p className="mt-1 text-2xs tabular-nums text-auditor-muted">{progress}%</p>
      )}
    </div>
  );
}
