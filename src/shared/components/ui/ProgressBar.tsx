import { motion } from 'framer-motion';

interface ProgressBarProps {
  value: number;
  label?: string;
  showValue?: boolean;
  size?: 'sm' | 'md';
}

export function ProgressBar({ value, label, showValue = true, size = 'md' }: ProgressBarProps) {
  const clamped = Math.min(100, Math.max(0, value));
  const height = size === 'sm' ? 'h-1.5' : 'h-2';

  return (
    <div className="space-y-2">
      {(label || showValue) && (
        <div className="flex items-center justify-between gap-2 text-2xs text-auditor-muted">
          {label && <span className="truncate font-medium text-auditor-text-secondary">{label}</span>}
          {showValue && (
            <span className="shrink-0 tabular-nums" aria-hidden="true">
              {clamped}%
            </span>
          )}
        </div>
      )}
      <div
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={clamped}
        aria-label={label ?? 'Progress'}
        className={`overflow-hidden rounded-full bg-auditor-bg-elevated ${height}`}
      >
        <motion.div
          className={`rounded-full bg-gradient-to-r from-auditor-accent to-auditor-accent-hover ${height}`}
          initial={false}
          animate={{ width: `${clamped}%` }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
        />
      </div>
    </div>
  );
}

interface ScoreRingProps {
  value: number | null;
  max?: number;
  label: string;
  unit?: string;
  tone?: 'success' | 'warning' | 'danger' | 'neutral' | 'accent';
  description?: string;
  size?: 'sm' | 'md' | 'lg';
  displayOverride?: string;
}

const toneStroke: Record<NonNullable<ScoreRingProps['tone']>, string> = {
  success: 'rgb(52 211 153)',
  warning: 'rgb(251 191 36)',
  danger: 'rgb(248 113 113)',
  neutral: 'rgb(113 113 122)',
  accent: 'rgb(139 92 246)',
};

const sizeMap = {
  sm: 56,
  md: 80,
  lg: 120,
};

export function ScoreRing({
  value,
  max = 100,
  label,
  unit,
  tone = 'neutral',
  description,
  size = 'md',
  displayOverride,
}: ScoreRingProps) {
  const ringSize = sizeMap[size];
  const stroke = size === 'lg' ? 8 : 6;
  const radius = (ringSize - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const ratio = value === null ? 0 : Math.min(value / max, 1);
  const offset = circumference - ratio * circumference;
  const display =
    displayOverride ??
    (value === null ? '—' : unit === 'unitless' ? value.toFixed(3) : String(Math.round(value)));

  return (
    <div
      className="flex flex-col items-center gap-2 text-center"
      role="img"
      aria-label={`${label}: ${display}${unit && unit !== 'unitless' ? ` ${unit}` : ''}`}
    >
      <div className="relative" style={{ width: ringSize, height: ringSize }}>
        <svg width={ringSize} height={ringSize} className="-rotate-90" aria-hidden="true">
          <circle
            cx={ringSize / 2}
            cy={ringSize / 2}
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth={stroke}
            className="text-auditor-border-subtle"
          />
          <motion.circle
            cx={ringSize / 2}
            cy={ringSize / 2}
            r={radius}
            fill="none"
            stroke={toneStroke[tone]}
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={false}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center px-1" aria-hidden="true">
          <span
            className={`font-semibold tabular-nums text-auditor-text ${size === 'lg' ? 'text-3xl' : size === 'md' ? 'text-lg' : 'text-sm'}`}
          >
            {display}
          </span>
          {unit && unit !== 'unitless' && size !== 'lg' && (
            <span className="text-3xs text-auditor-muted">{unit}</span>
          )}
        </div>
      </div>
      <div>
        <p
          className={`font-medium text-auditor-text-secondary ${size === 'lg' ? 'text-sm' : 'text-xs'}`}
        >
          {label}
        </p>
        {description && <p className="mt-0.5 text-2xs text-auditor-muted">{description}</p>}
      </div>
    </div>
  );
}
