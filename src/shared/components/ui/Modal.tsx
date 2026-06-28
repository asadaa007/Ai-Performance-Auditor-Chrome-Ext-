import { AnimatePresence, motion } from 'framer-motion';
import { useId, useRef, type ReactNode } from 'react';
import { useFocusTrap } from '@shared/hooks/useFocusTrap';
import { Button } from './Button';

interface ModalProps {
  open: boolean;
  title: string;
  children: ReactNode;
  onClose: () => void;
}

export function Modal({ open, title, children, onClose }: ModalProps) {
  const titleId = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  useFocusTrap(panelRef, open);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          role="presentation"
        >
          <button
            type="button"
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={onClose}
            aria-label="Close dialog"
            tabIndex={-1}
          />
          <motion.div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            initial={{ opacity: 0, scale: 0.98, y: 6 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98, y: 6 }}
            transition={{ duration: 0.18 }}
            className="glass-panel relative z-10 w-full max-w-2xl rounded-2xl p-5 shadow-glow"
          >
            <div className="mb-4 flex items-start justify-between gap-3">
              <h3 id={titleId} className="text-base font-semibold tracking-tight text-auditor-text">
                {title}
              </h3>
              <Button variant="ghost" size="sm" onClick={onClose} aria-label="Close">
                Close
              </Button>
            </div>
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

interface CodeBlockProps {
  code: string;
  className?: string;
}

export function CodeBlock({ code, className = '' }: CodeBlockProps) {
  return (
    <pre
      className={`overflow-x-auto rounded-lg border border-auditor-border-subtle bg-auditor-bg-elevated p-3 font-mono text-2xs leading-relaxed text-auditor-text-secondary ${className}`}
    >
      <code>{code}</code>
    </pre>
  );
}
