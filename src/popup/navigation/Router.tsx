import { AccessibilityPage } from '@popup/pages/AccessibilityPage';
import { AiPage } from '@popup/pages/AiPage';
import { CssPage } from '@popup/pages/CssPage';
import { DashboardPage } from '@popup/pages/DashboardPage';
import { DomPage } from '@popup/pages/DomPage';
import { ImagesPage } from '@popup/pages/ImagesPage';
import { JavaScriptPage } from '@popup/pages/JavaScriptPage';
import { MetaPage } from '@popup/pages/MetaPage';
import { PerformancePage } from '@popup/pages/PerformancePage';
import { ResourcesPage } from '@popup/pages/ResourcesPage';
import { SettingsPage } from '@popup/pages/SettingsPage';
import { useNavigationStore } from '@popup/store/navigationStore';

export function Router() {
  const route = useNavigationStore((state) => state.route);

  switch (route) {
    case 'dashboard':
      return <DashboardPage />;
    case 'performance':
      return <PerformancePage />;
    case 'resources':
      return <ResourcesPage />;
    case 'dom':
      return <DomPage />;
    case 'images':
      return <ImagesPage />;
    case 'css':
      return <CssPage />;
    case 'javascript':
      return <JavaScriptPage />;
    case 'accessibility':
      return <AccessibilityPage />;
    case 'meta':
      return <MetaPage />;
    case 'settings':
      return <SettingsPage />;
    case 'ai':
      return <AiPage />;
    default:
      return <DashboardPage />;
  }
}
