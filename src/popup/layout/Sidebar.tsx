import { motion } from 'framer-motion';
import { NAV_ITEMS } from '@popup/navigation/routes';
import { useNavigationStore } from '@popup/store/navigationStore';
import { Badge } from '@shared/components';

export function Sidebar() {
  const route = useNavigationStore((state) => state.route);
  const setRoute = useNavigationStore((state) => state.setRoute);

  return (
    <aside className="flex w-44 shrink-0 flex-col border-r border-auditor-border-subtle bg-auditor-bg-elevated">
      <div className="border-b border-auditor-border-subtle px-4 py-4">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-auditor-accent-muted text-xs font-bold text-auditor-accent">
            AI
          </div>
          <div>
            <p className="text-xs font-semibold text-auditor-text">Auditor</p>
            <p className="text-2xs text-auditor-muted">Performance</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto p-2">
        {NAV_ITEMS.map((item) => (
          <SidebarItem
            key={item.id}
            item={item}
            active={route === item.id}
            onSelect={() => !item.disabled && setRoute(item.id)}
          />
        ))}
      </nav>
    </aside>
  );
}

function SidebarItem({
  item,
  active,
  onSelect,
}: {
  item: (typeof NAV_ITEMS)[number];
  active: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      disabled={item.disabled}
      onClick={onSelect}
      className={`relative mb-0.5 flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-xs transition-colors ${
        item.disabled
          ? 'cursor-not-allowed opacity-40'
          : active
            ? 'text-auditor-text'
            : 'text-auditor-muted-foreground hover:bg-auditor-surface hover:text-auditor-text-secondary'
      }`}
    >
      {active && (
        <motion.div
          layoutId="sidebar-active"
          className="absolute inset-0 rounded-lg bg-auditor-surface shadow-card"
          transition={{ type: 'spring', stiffness: 380, damping: 30 }}
        />
      )}
      <span className="relative z-10 w-4 text-center opacity-70">{item.icon}</span>
      <span className="relative z-10 flex-1 truncate">{item.label}</span>
      {item.badge && (
        <Badge tone="accent" className="relative z-10">
          {item.badge}
        </Badge>
      )}
    </button>
  );
}
