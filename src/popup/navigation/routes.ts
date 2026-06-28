export type AppRoute =
  | 'dashboard'
  | 'performance'
  | 'resources'
  | 'dom'
  | 'images'
  | 'css'
  | 'javascript'
  | 'accessibility'
  | 'meta'
  | 'settings'
  | 'ai';

export interface NavItem {
  id: AppRoute;
  label: string;
  icon: string;
  disabled?: boolean;
  badge?: string;
}

export const NAV_ITEMS: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: '◈' },
  { id: 'performance', label: 'Performance', icon: '◎' },
  { id: 'resources', label: 'Resources', icon: '⬡' },
  { id: 'dom', label: 'DOM', icon: '◇' },
  { id: 'images', label: 'Images', icon: '▣' },
  { id: 'css', label: 'CSS', icon: '◐' },
  { id: 'javascript', label: 'JavaScript', icon: '◉' },
  { id: 'accessibility', label: 'Accessibility', icon: '◫' },
  { id: 'meta', label: 'Meta', icon: '◧' },
  { id: 'settings', label: 'Settings', icon: '⚙' },
  { id: 'ai', label: 'AI Insights', icon: '✦' },
];

export const APP_VERSION = '1.0.0';
