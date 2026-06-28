import { AnimatePresence, motion } from 'framer-motion';
import { useId, useState, type ReactNode } from 'react';

interface AccordionItemProps {
  title: string;
  subtitle?: string;
  badge?: ReactNode;
  children: ReactNode;
  defaultOpen?: boolean;
}

export function AccordionItem({
  title,
  subtitle,
  badge,
  children,
  defaultOpen = false,
}: AccordionItemProps) {
  const [open, setOpen] = useState(defaultOpen);
  const panelId = useId();

  return (
    <div className="border-b border-auditor-border-subtle last:border-b-0">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-controls={panelId}
        className="flex w-full items-center justify-between gap-3 px-3 py-3 text-left transition-colors duration-fast hover:bg-auditor-surface-hover focus-visible:ring-auditor-accent"
      >
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-auditor-text-secondary">{title}</p>
          {subtitle && <p className="truncate text-2xs text-auditor-muted">{subtitle}</p>}
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {badge}
          <span
            className={`text-auditor-muted transition-transform duration-fast ${open ? 'rotate-180' : ''}`}
            aria-hidden="true"
          >
            ▾
          </span>
        </div>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            id={panelId}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="overflow-hidden"
          >
            <div className="px-3 pb-3 text-xs leading-relaxed">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

interface TabsProps<T extends string> {
  items: Array<{ id: T; label: string }>;
  value: T;
  onChange: (value: T) => void;
}

export function Tabs<T extends string>({ items, value, onChange }: TabsProps<T>) {
  return (
    <div
      role="tablist"
      aria-label="Sections"
      className="flex gap-1 rounded-lg border border-auditor-border-subtle bg-auditor-bg-elevated p-1"
    >
      {items.map((item) => {
        const active = item.id === value;
        return (
          <button
            key={item.id}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(item.id)}
            className={`relative flex-1 rounded-md px-3 py-2 text-xs font-medium transition-colors duration-fast focus-visible:ring-auditor-accent ${
              active ? 'bg-auditor-surface text-auditor-text shadow-card' : 'text-auditor-muted hover:text-auditor-text-secondary'
            }`}
          >
            {item.label}
          </button>
        );
      })}
    </div>
  );
}

interface TooltipProps {
  content: string;
  children: ReactNode;
}

export function Tooltip({ content, children }: TooltipProps) {
  return (
    <span className="group relative inline-flex">
      {children}
      <span
        role="tooltip"
        className="pointer-events-none absolute bottom-full left-1/2 z-50 mb-2 -translate-x-1/2 whitespace-nowrap rounded-md border border-auditor-border bg-auditor-surface px-2.5 py-1 text-2xs text-auditor-text-secondary opacity-0 shadow-card transition-opacity duration-fast group-focus-within:opacity-100 group-hover:opacity-100"
      >
        {content}
      </span>
    </span>
  );
}
