import { create } from 'zustand';
import type { AuditSnapshot } from '@shared/snapshots';

interface SnapshotState {
  auditId: string | null;
  snapshot: AuditSnapshot | null;
  isLoading: boolean;
  error: string | null;
  setLoading: (auditId: string) => void;
  setSnapshot: (snapshot: AuditSnapshot) => void;
  setError: (message: string) => void;
  reset: () => void;
}

const initialState = {
  auditId: null,
  snapshot: null,
  isLoading: false,
  error: null,
};

export const useSnapshotStore = create<SnapshotState>((set) => ({
  ...initialState,
  setLoading: (auditId) =>
    set({
      auditId,
      snapshot: null,
      isLoading: true,
      error: null,
    }),
  setSnapshot: (snapshot) =>
    set({
      auditId: snapshot.auditId,
      snapshot,
      isLoading: false,
      error: null,
    }),
  setError: (message) =>
    set({
      isLoading: false,
      error: message,
    }),
  reset: () => set(initialState),
}));
