import type { AppRoute } from '@popup/navigation/routes';
import { create } from 'zustand';

interface NavigationState {
  route: AppRoute;
  setRoute: (route: AppRoute) => void;
}

export const useNavigationStore = create<NavigationState>((set) => ({
  route: 'dashboard',
  setRoute: (route) => set({ route }),
}));
