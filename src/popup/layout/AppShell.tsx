import { AnimatePresence, motion } from 'framer-motion';
import { useEffect } from 'react';
import { Sidebar } from '@popup/layout/Sidebar';
import { TopBar } from '@popup/layout/TopBar';
import { getPopupMessageBus } from '@popup/messaging/popupBus';
import { Router } from '@popup/navigation/Router';
import { initializeAuditChannel } from '@popup/store/auditStore';
import { useNavigationStore } from '@popup/store/navigationStore';

export function AppShell() {
  const route = useNavigationStore((state) => state.route);

  useEffect(() => {
    void initializeAuditChannel(getPopupMessageBus());
  }, []);

  return (
    <div className="flex h-[600px] w-[800px] overflow-hidden bg-auditor-bg">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <TopBar />
        <main className="relative flex-1 overflow-y-auto p-4">
          <AnimatePresence mode="wait">
            <motion.div
              key={route}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.2 }}
              className="h-full"
            >
              <Router />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
