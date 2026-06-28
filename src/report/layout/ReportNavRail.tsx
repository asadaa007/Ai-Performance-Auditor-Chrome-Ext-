import { NavLink, useLocation } from 'react-router-dom';
import { REPORT_NAV_GROUPS, type ReportNavGroupId } from '@report/navigation/routes';
import { useReportUiStore } from '@report/store/uiStore';
import { NavIcon } from '@shared/components/NavIcon';

const GROUP_ICONS: Record<ReportNavGroupId, 'home' | 'chart' | 'code' | 'sparkles'> = {
  main: 'home',
  audit: 'chart',
  assets: 'code',
  tools: 'sparkles',
};

export function ReportNavRail() {
  const activeNavGroup = useReportUiStore((s) => s.activeNavGroup);
  const setActiveNavGroup = useReportUiStore((s) => s.setActiveNavGroup);
  const setSidebarCollapsed = useReportUiStore((s) => s.setSidebarCollapsed);
  const sidebarCollapsed = useReportUiStore((s) => s.sidebarCollapsed);
  const location = useLocation();

  const handleGroupClick = (groupId: ReportNavGroupId) => {
    if (activeNavGroup === groupId && !sidebarCollapsed) {
      setSidebarCollapsed(true);
      return;
    }
    setActiveNavGroup(groupId);
  };

  return (
    <aside
      className="report-no-print flex w-[52px] shrink-0 flex-col items-center border-r border-auditor-border-subtle bg-auditor-bg py-3"
      aria-label="Primary navigation"
    >
      <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-xl bg-auditor-accent-muted">
        <NavIcon name="dashboard" size={20} className="text-auditor-accent" />
      </div>

      <nav className="flex flex-1 flex-col items-center gap-1 pt-2">
        {REPORT_NAV_GROUPS.map((group) => {
          const isActive = activeNavGroup === group.id;
          return (
            <button
              key={group.id}
              type="button"
              className={`nav-rail-btn ${isActive && !sidebarCollapsed ? 'nav-rail-btn-active' : ''}`}
              aria-label={group.label}
              aria-pressed={isActive}
              title={group.label}
              onClick={() => handleGroupClick(group.id)}
            >
              <NavIcon name={GROUP_ICONS[group.id]} size={20} />
            </button>
          );
        })}
      </nav>

      <NavLink
        to="/settings"
        className={({ isActive }) =>
          `nav-rail-btn mb-1 ${isActive || location.pathname === '/settings' ? 'nav-rail-btn-active' : ''}`
        }
        aria-label="Settings"
        title="Settings"
        onClick={() => setActiveNavGroup('tools')}
      >
        <NavIcon name="gear" size={20} />
      </NavLink>
    </aside>
  );
}
