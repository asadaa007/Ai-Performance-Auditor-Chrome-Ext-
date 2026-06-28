import { NavLink, useLocation } from 'react-router-dom';
import { REPORT_NAV_ITEMS } from '@report/navigation/routes';
import { useReportUiStore } from '@report/store/uiStore';
import { NavIcon, type NavIconName } from '@shared/components/NavIcon';

export function ReportSidebar() {
  const sidebarWidth = useReportUiStore((s) => s.sidebarWidth);
  const sidebarCollapsed = useReportUiStore((s) => s.sidebarCollapsed);
  const activeNavGroup = useReportUiStore((s) => s.activeNavGroup);
  const setSidebarWidth = useReportUiStore((s) => s.setSidebarWidth);
  const setSidebarCollapsed = useReportUiStore((s) => s.setSidebarCollapsed);
  const location = useLocation();

  const items = REPORT_NAV_ITEMS.filter((item) => item.navGroup === activeNavGroup);

  if (sidebarCollapsed) {
    return null;
  }

  return (
    <aside
      className="report-sidebar report-no-print relative flex h-full shrink-0 flex-col overflow-hidden border-r border-auditor-border-subtle bg-auditor-bg-elevated/95"
      style={{ width: sidebarWidth }}
    >
      <div className="flex items-center justify-between border-b border-auditor-border-subtle px-4 py-3">
        <div>
          <p className="text-xs font-semibold text-auditor-text">Sections</p>
          <p className="text-2xs text-auditor-muted capitalize">{activeNavGroup}</p>
        </div>
        <button
          type="button"
          className="rounded-lg px-2 py-1 text-2xs text-auditor-muted hover:bg-auditor-surface-hover hover:text-auditor-text"
          onClick={() => setSidebarCollapsed(true)}
          aria-label="Collapse navigation panel"
        >
          ‹
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto p-2" aria-label="Report sections">
        <ul className="space-y-0.5">
          {items.map((item) => (
            <li key={item.id}>
              <NavLink
                to={item.path}
                end={item.path === '/'}
                className={({ isActive }) =>
                  `nav-link ${isActive || location.pathname === item.path ? 'nav-link-active' : 'nav-link-inactive'}`
                }
              >
                <span className="flex h-5 w-5 shrink-0 items-center justify-center">
                  <NavIcon name={item.icon as NavIconName} size={16} />
                </span>
                <span className="truncate">{item.label}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      <div
        className="absolute bottom-0 right-0 top-0 w-1 cursor-col-resize hover:bg-auditor-accent/30"
        role="separator"
        aria-orientation="vertical"
        aria-label="Resize sidebar"
        onMouseDown={(event) => {
          event.preventDefault();
          const startX = event.clientX;
          const startWidth = sidebarWidth;

          const onMove = (moveEvent: MouseEvent) => {
            const next = Math.min(320, Math.max(200, startWidth + moveEvent.clientX - startX));
            setSidebarWidth(next);
          };

          const onUp = () => {
            window.removeEventListener('mousemove', onMove);
            window.removeEventListener('mouseup', onUp);
          };

          window.addEventListener('mousemove', onMove);
          window.addEventListener('mouseup', onUp);
        }}
      />
    </aside>
  );
}
