import type { AppRoute } from '@popup/navigation/routes';
import { useNavigationStore } from '@popup/store/navigationStore';

export function navigateTo(route: AppRoute): void {
  useNavigationStore.getState().setRoute(route);
}
