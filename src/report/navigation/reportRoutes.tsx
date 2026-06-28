import { lazy } from 'react';
import type { RouteObject } from 'react-router-dom';
import { ReportLayout } from '@report/layout/ReportLayout';

const OverviewPage = lazy(() =>
  import('@report/pages/OverviewPage').then((m) => ({ default: m.OverviewPage })),
);
const DeveloperPage = lazy(() =>
  import('@report/pages/DeveloperPage').then((m) => ({ default: m.DeveloperPage })),
);
const PerformancePage = lazy(() =>
  import('@report/pages/PerformancePage').then((m) => ({ default: m.PerformancePage })),
);
const AccessibilityPage = lazy(() =>
  import('@report/pages/AccessibilityPage').then((m) => ({ default: m.AccessibilityPage })),
);
const SeoPage = lazy(() =>
  import('@report/pages/CategoryPages').then((m) => ({ default: m.SeoPage })),
);
const BestPracticesPage = lazy(() =>
  import('@report/pages/CategoryPages').then((m) => ({ default: m.BestPracticesPage })),
);
const SecurityPage = lazy(() =>
  import('@report/pages/CategoryPages').then((m) => ({ default: m.SecurityPage })),
);
const NetworkPage = lazy(() =>
  import('@report/pages/CategoryPages').then((m) => ({ default: m.NetworkPage })),
);
const ResourcesPage = lazy(() =>
  import('@report/pages/ResourcesPage').then((m) => ({ default: m.ResourcesPage })),
);
const ImagesPage = lazy(() =>
  import('@report/pages/ImagesPage').then((m) => ({ default: m.ImagesPage })),
);
const FontsPage = lazy(() =>
  import('@report/pages/CategoryPages').then((m) => ({ default: m.FontsPage })),
);
const JavaScriptPage = lazy(() =>
  import('@report/pages/JavaScriptPage').then((m) => ({ default: m.JavaScriptPage })),
);
const CssPage = lazy(() => import('@report/pages/CssPage').then((m) => ({ default: m.CssPage })));
const DomPage = lazy(() => import('@report/pages/DomPage').then((m) => ({ default: m.DomPage })));
const StoragePage = lazy(() =>
  import('@report/pages/CategoryPages').then((m) => ({ default: m.StoragePage })),
);
const ThirdPartyPage = lazy(() =>
  import('@report/pages/ThirdPartyPage').then((m) => ({ default: m.ThirdPartyPage })),
);
const HeadersPage = lazy(() =>
  import('@report/pages/HeadersPage').then((m) => ({ default: m.HeadersPage })),
);
const HistoryPage = lazy(() =>
  import('@report/pages/HistoryPage').then((m) => ({ default: m.HistoryPage })),
);
const SettingsPage = lazy(() =>
  import('@report/pages/SettingsPage').then((m) => ({ default: m.SettingsPage })),
);
const AiPage = lazy(() => import('@report/pages/AiPage').then((m) => ({ default: m.AiPage })));

export const reportRoutes: RouteObject[] = [
  {
    path: '/',
    element: <ReportLayout />,
    children: [
      { index: true, element: <OverviewPage /> },
      { path: 'developer', element: <DeveloperPage /> },
      { path: 'performance', element: <PerformancePage /> },
      { path: 'accessibility', element: <AccessibilityPage /> },
      { path: 'seo', element: <SeoPage /> },
      { path: 'best-practices', element: <BestPracticesPage /> },
      { path: 'security', element: <SecurityPage /> },
      { path: 'network', element: <NetworkPage /> },
      { path: 'resources', element: <ResourcesPage /> },
      { path: 'images', element: <ImagesPage /> },
      { path: 'fonts', element: <FontsPage /> },
      { path: 'javascript', element: <JavaScriptPage /> },
      { path: 'css', element: <CssPage /> },
      { path: 'dom', element: <DomPage /> },
      { path: 'storage', element: <StoragePage /> },
      { path: 'third-party', element: <ThirdPartyPage /> },
      { path: 'headers', element: <HeadersPage /> },
      { path: 'history', element: <HistoryPage /> },
      { path: 'settings', element: <SettingsPage /> },
      { path: 'ai', element: <AiPage /> },
    ],
  },
];
