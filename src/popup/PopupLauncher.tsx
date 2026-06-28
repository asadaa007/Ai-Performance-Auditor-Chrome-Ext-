import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAudit, useAuditProgress, useAuditStatus } from '@popup/hooks';
import { getPopupMessageBus } from '@popup/messaging/popupBus';
import { getReportUrl, initializeAuditChannel, useAuditStore } from '@shared/audit';
import { ExtensionLogo, ProgressBar } from '@shared/components';
import { NavIcon } from '@shared/components/NavIcon';
import { formatTimestamp, formatUrl } from '@shared/utils';

const SCAN_PHASES = [
  'Initializing collectors',
  'Measuring Web Vitals',
  'Analyzing resources',
  'Running accessibility checks',
  'Building report',
];

export function PopupLauncher() {
  const { isCollecting } = useAuditStatus();
  const url = useAuditStore((state) => state.url);
  const { progress, currentCollector } = useAuditProgress();
  const { startAudit } = useAudit();
  const completedAt = useAuditStore((state) => state.completedAt);
  const auditId = useAuditStore((state) => state.auditId);
  const status = useAuditStore((state) => state.status);
  const closedRef = useRef(false);

  useEffect(() => {
    void initializeAuditChannel(getPopupMessageBus());
  }, []);

  useEffect(() => {
    if (status === 'completed' && auditId && !closedRef.current) {
      closedRef.current = true;
      const timer = window.setTimeout(() => {
        window.close();
      }, 900);
      return () => window.clearTimeout(timer);
    }
    return undefined;
  }, [status, auditId]);

  const phaseIndex = Math.min(
    SCAN_PHASES.length - 1,
    Math.floor((progress / 100) * SCAN_PHASES.length),
  );

  const openSettings = () => {
    if (auditId) {
      void chrome.tabs.create({ url: `${getReportUrl(auditId)}#/settings` });
    }
  };

  return (
    <div className="flex w-[400px] flex-col bg-auditor-bg">
      <div className="relative overflow-hidden px-6 pb-2 pt-6">
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-auditor-accent/10 via-transparent to-transparent" />
        <header className="relative flex flex-col items-center gap-3 text-center">
          <ExtensionLogo size={48} />
          <div>
            <h1 className="text-base font-semibold tracking-tight text-auditor-text">
              AI Performance Auditor
            </h1>
            <p className="mt-0.5 text-2xs text-auditor-muted">Analyze · Understand · Optimize</p>
          </div>
        </header>
      </div>

      <div className="flex flex-1 flex-col gap-5 px-6 pb-6">
        <div className="rounded-xl border border-auditor-border-subtle bg-auditor-surface/60 px-4 py-3">
          <p className="text-3xs font-medium uppercase tracking-wider text-auditor-muted">
            Target page
          </p>
          <p className="mt-1.5 truncate font-mono text-xs text-auditor-text-secondary">
            {formatUrl(url, 48) || 'No active tab'}
          </p>
        </div>

        <AnimatePresence mode="wait">
          {isCollecting ? (
            <motion.section
              key="scanning"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="space-y-4 rounded-2xl border border-auditor-accent/20 bg-auditor-accent-muted/30 p-5"
            >
              <div className="scan-ring mx-auto h-16 w-16">
                <NavIcon name="scan" size={32} className="relative text-auditor-accent" />
              </div>
              <div className="text-center">
                <p className="text-sm font-medium text-auditor-text">Scanning website</p>
                <p className="mt-1 text-2xs text-auditor-muted">{SCAN_PHASES[phaseIndex]}</p>
              </div>
              <ProgressBar
                value={progress}
                label={currentCollector ?? 'Collecting data'}
                size="md"
              />
              <ul className="space-y-1.5">
                {SCAN_PHASES.map((phase, index) => (
                  <li
                    key={phase}
                    className={`flex items-center gap-2 text-2xs ${
                      index <= phaseIndex ? 'text-auditor-text-secondary' : 'text-auditor-muted'
                    }`}
                  >
                    <span
                      className={`h-1.5 w-1.5 rounded-full ${
                        index < phaseIndex
                          ? 'bg-auditor-success'
                          : index === phaseIndex
                            ? 'bg-auditor-accent animate-pulse'
                            : 'bg-auditor-border'
                      }`}
                    />
                    {phase}
                  </li>
                ))}
              </ul>
            </motion.section>
          ) : status === 'completed' && auditId ? (
            <motion.section
              key="done"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center gap-3 rounded-2xl border border-auditor-success/20 bg-auditor-success-muted p-5 text-center"
            >
              <NavIcon name="checked" size={36} className="text-auditor-success" />
              <p className="text-sm font-medium text-auditor-text">Report ready</p>
              <p className="text-2xs text-auditor-muted">Opening in a new tab…</p>
            </motion.section>
          ) : null}
        </AnimatePresence>

        <button
          type="button"
          className="popup-cta inline-flex items-center justify-center gap-2"
          onClick={() => void startAudit()}
          disabled={isCollecting}
        >
          <NavIcon name="rocket" size={18} className="text-white" />
          {isCollecting ? 'Analyzing…' : 'Analyze Website'}
        </button>

        {completedAt && status === 'completed' && (
          <p className="text-center text-2xs text-auditor-muted">
            Last scan {formatTimestamp(completedAt)}
          </p>
        )}

        <footer className="flex justify-center border-t border-auditor-border-subtle pt-4">
          <button
            type="button"
            className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-2xs text-auditor-muted transition-colors hover:bg-auditor-surface-hover hover:text-auditor-text disabled:opacity-40"
            onClick={openSettings}
            disabled={!auditId}
          >
            <NavIcon name="gear" size={14} />
            Settings
          </button>
        </footer>
      </div>
    </div>
  );
}
