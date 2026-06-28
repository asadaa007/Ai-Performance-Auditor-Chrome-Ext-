import type {
  AuditCompletedPayload,
  AuditFailedPayload,
  AuditPageChangedPayload,
  AuditProgressPayload,
  AuditStartedPayload,
  AuditStatus,
  TabAuditSnapshot,
} from '@shared/messaging';
import type { AuditResult } from '@shared/types';
import type { SerializedAuditError } from '@shared/errors';
import { create } from 'zustand';

interface AuditState {
  tabId: number | null;
  auditId: string | null;
  status: AuditStatus | 'idle';
  progress: number;
  currentCollector: string | null;
  result: AuditResult | null;
  error: SerializedAuditError | null;
  url: string | null;
  collectionDurationMs: number | null;
  completedAt: number | null;
  isHydrated: boolean;
  setSnapshot: (snapshot: TabAuditSnapshot | null) => void;
  setProgress: (payload: AuditProgressPayload) => void;
  setStarted: (payload: AuditStartedPayload) => void;
  setCompleted: (payload: AuditCompletedPayload) => void;
  setFailed: (payload: AuditFailedPayload) => void;
  setPageChanged: (payload: AuditPageChangedPayload) => void;
  reset: () => void;
}

const initialState = {
  tabId: null,
  auditId: null,
  status: 'idle' as const,
  progress: 0,
  currentCollector: null,
  result: null,
  error: null,
  url: null,
  collectionDurationMs: null,
  completedAt: null,
  isHydrated: false,
};

export const useAuditStore = create<AuditState>((set, get) => ({
  ...initialState,
  setSnapshot: (snapshot) => {
    if (!snapshot) {
      set({ ...initialState, isHydrated: true });
      return;
    }

    set({
      tabId: snapshot.tabId,
      auditId: snapshot.auditId,
      status: snapshot.status,
      progress: snapshot.progress,
      currentCollector: snapshot.currentCollector,
      result: snapshot.result,
      error: snapshot.error,
      url: snapshot.url,
      collectionDurationMs: snapshot.collectionDurationMs,
      completedAt: snapshot.completedAt,
      isHydrated: true,
    });
  },
  setProgress: (payload) => {
    const { tabId, auditId } = get();
    if (tabId !== payload.tabId || auditId !== payload.auditId) {
      return;
    }

    set({
      status: 'collecting',
      progress: payload.progress,
      currentCollector: payload.statusMessage ?? payload.collector,
    });
  },
  setStarted: (payload) => {
    set({
      tabId: payload.tabId,
      auditId: payload.auditId,
      status: 'collecting',
      progress: 0,
      currentCollector: null,
      result: null,
      error: null,
      url: payload.url,
      collectionDurationMs: null,
      completedAt: null,
      isHydrated: true,
    });
  },
  setCompleted: (payload) => {
    const { tabId, auditId } = get();
    if (tabId !== null && tabId !== payload.tabId) {
      return;
    }
    if (auditId !== null && auditId !== payload.auditId) {
      return;
    }

    set({
      tabId: payload.tabId,
      auditId: payload.auditId,
      status: 'completed',
      progress: 100,
      currentCollector: null,
      result: payload.result,
      error: null,
      url: payload.result.meta.url,
      collectionDurationMs: payload.result.meta.collectionDurationMs,
      completedAt: Date.now(),
    });
  },
  setFailed: (payload) => {
    const { tabId, auditId } = get();
    if (tabId !== payload.tabId || (auditId && auditId !== payload.auditId)) {
      return;
    }

    set({
      status: 'failed',
      error: payload.error,
      currentCollector: null,
    });
  },
  setPageChanged: (payload) => {
    const { tabId } = get();
    if (tabId !== null && tabId !== payload.tabId) {
      return;
    }

    set({
      tabId: payload.tabId,
      auditId: null,
      status: 'idle',
      progress: 0,
      currentCollector: null,
      result: null,
      error: null,
      url: payload.nextUrl,
      collectionDurationMs: null,
      completedAt: null,
      isHydrated: true,
    });
  },
  reset: () => set({ ...initialState, isHydrated: true }),
}));
