import { Suspense, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { ReportHeader } from '@report/layout/ReportHeader';
import { ReportNavRail } from '@report/layout/ReportNavRail';
import { ReportSidebar } from '@report/layout/ReportSidebar';
import { CommandPalette } from '@report/components/CommandPalette';
import { useHydrateSnapshot } from '@report/hooks/useHydrateSnapshot';
import { useSnapshotData } from '@report/hooks/useSnapshotData';
import { getReportAuditId } from '@report/hooks/useReportAuditId';
import { REPORT_NAV_ITEMS } from '@report/navigation/routes';
import { useReportUiStore } from '@report/store/uiStore';
import { LoadingOverlay, EmptyState, ErrorState } from '@shared/components';
import { NavIcon } from '@shared/components/NavIcon';

export function ReportLayout() {
  const location = useLocation();
  const auditId = getReportAuditId();
  const { isLoading, error, hasSnapshot } = useSnapshotData();
  const sidebarCollapsed = useReportUiStore((s) => s.sidebarCollapsed);
  const setSidebarCollapsed = useReportUiStore((s) => s.setSidebarCollapsed);
  const setActiveNavGroup = useReportUiStore((s) => s.setActiveNavGroup);

  useHydrateSnapshot();

  useEffect(() => {
    const match = REPORT_NAV_ITEMS.find((item) => item.path === location.pathname);
    if (match) {
      setActiveNavGroup(match.navGroup);
    }
  }, [location.pathname, setActiveNavGroup]);

  if (!auditId) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-auditor-bg p-8">
        <div className="max-w-md text-center">
          <EmptyState
            title="Missing audit id"
            description="Open a report from the extension popup after analyzing a page, or use a valid report URL with ?auditId=."
            icon={<NavIcon name="scan" size={32} className="mx-auto text-auditor-muted" />}
          />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-auditor-bg p-8">
        <div className="max-w-md">
          <ErrorState title="Report unavailable" message={error} />
        </div>
      </div>
    );
  }

  if (isLoading || !hasSnapshot) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-auditor-bg">
        <LoadingOverlay visible label="Loading audit snapshot…" fullscreen />
      </div>
    );
  }

  return (
    <div className="report-shell flex h-screen flex-col overflow-hidden bg-auditor-bg">
      <ReportHeader />
      <div className="flex min-h-0 flex-1 overflow-hidden">
        <ReportNavRail />
        {sidebarCollapsed && (
          <button
            type="button"
            className="report-no-print flex w-6 shrink-0 items-center justify-center border-r border-auditor-border-subtle bg-auditor-bg-elevated text-auditor-muted hover:text-auditor-text"
            onClick={() => setSidebarCollapsed(false)}
            aria-label="Expand navigation panel"
            title="Show sections"
          >
            ›
          </button>
        )}
        <ReportSidebar />
        <main className="min-w-0 flex-1 overflow-y-auto bg-auditor-bg px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.2 }}
              className="w-full"
            >
              <Suspense fallback={<LoadingOverlay visible label="Loading section…" />}>
                <Outlet />
              </Suspense>
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
      <CommandPalette />
    </div>
  );
}
