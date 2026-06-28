import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useReportUiStore } from '@report/store/uiStore';
import { REPORT_NAV_ITEMS, type ReportRouteId } from '@report/navigation/routes';
import { NavIcon, type NavIconName } from '@shared/components/NavIcon';
import { useFocusTrap } from '@shared/hooks/useFocusTrap';
import { getCommandKeyLabel } from '@shared/utils/platform';

export function CommandPalette() {
  const open = useReportUiStore((s) => s.commandPaletteOpen);
  const setOpen = useReportUiStore((s) => s.setCommandPaletteOpen);
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const panelRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const shortcut = getCommandKeyLabel();

  useFocusTrap(panelRef, open);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        setOpen(!open);
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open, setOpen]);

  const items = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return REPORT_NAV_ITEMS.filter((item) =>
      normalized ? item.label.toLowerCase().includes(normalized) : true,
    );
  }, [query]);

  useEffect(() => {
    setActiveIndex(0);
  }, [query, open]);

  if (!open) {
    return null;
  }

  const go = (path: ReportRouteId) => {
    navigate(path);
    setOpen(false);
    setQuery('');
  };

  const onPaletteKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Escape') {
      setOpen(false);
      return;
    }
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setActiveIndex((index) => (index + 1) % Math.max(items.length, 1));
    }
    if (event.key === 'ArrowUp') {
      event.preventDefault();
      setActiveIndex((index) => (index - 1 + Math.max(items.length, 1)) % Math.max(items.length, 1));
    }
    if (event.key === 'Enter' && items[activeIndex]) {
      event.preventDefault();
      go(items[activeIndex].path);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-black/70 p-6 pt-[10vh] backdrop-blur-sm"
      role="presentation"
      onClick={() => setOpen(false)}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label="Command palette"
        onKeyDown={onPaletteKeyDown}
        className="glass-panel w-full max-w-lg overflow-hidden rounded-2xl shadow-glow"
        onClick={(event) => event.stopPropagation()}
      >
        <input
          autoFocus
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Jump to section…"
          aria-label="Search sections"
          className="form-control w-full rounded-none border-0 border-b border-auditor-border-subtle bg-transparent px-4 py-3.5 text-sm"
        />
        <ul className="max-h-80 overflow-y-auto py-2" role="listbox">
          {items.map((item, index) => (
            <li key={item.id} role="option" aria-selected={index === activeIndex}>
              <button
                type="button"
                className={`flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm transition-colors duration-fast ${
                  index === activeIndex
                    ? 'bg-auditor-accent-muted text-auditor-text'
                    : 'text-auditor-text-secondary hover:bg-auditor-surface-hover hover:text-auditor-text'
                }`}
                onMouseEnter={() => setActiveIndex(index)}
                onClick={() => go(item.path)}
              >
                <span className="flex h-5 w-5 items-center justify-center" aria-hidden="true">
                  <NavIcon name={item.icon as NavIconName} size={16} />
                </span>
                <span>{item.label}</span>
              </button>
            </li>
          ))}
          {items.length === 0 && (
            <li className="px-4 py-4 text-sm text-auditor-muted">No matching sections</li>
          )}
        </ul>
        <p className="border-t border-auditor-border-subtle px-4 py-2.5 text-2xs text-auditor-muted">
          {shortcut} to open · ↑↓ navigate · Enter select · Esc close
        </p>
      </div>
    </div>
  );
}
