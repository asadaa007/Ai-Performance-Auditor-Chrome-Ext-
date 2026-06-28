import type { ElementType } from 'react';
import type { AnimatedIconProps } from '@shared/icons/itshover';
import {
  AccessibilityIcon,
  ChartLineIcon,
  ChartPieIcon,
  CheckedIcon,
  CodeIcon,
  GearIcon,
  GlobeIcon,
  HistoryCircleIcon,
  HomeIcon,
  LayoutDashboardIcon,
  RocketIcon,
  ScanHeartIcon,
  ShieldCheckIcon,
  SparklesIcon,
  TriangleAlertIcon,
} from '@shared/icons/itshover';

const ICON_MAP: Record<NavIconName, ElementType> = {
  home: HomeIcon,
  chart: ChartLineIcon,
  accessibility: AccessibilityIcon,
  globe: GlobeIcon,
  checked: CheckedIcon,
  shield: ShieldCheckIcon,
  'chart-pie': ChartPieIcon,
  code: CodeIcon,
  sparkles: SparklesIcon,
  history: HistoryCircleIcon,
  gear: GearIcon,
  scan: ScanHeartIcon,
  rocket: RocketIcon,
  alert: TriangleAlertIcon,
  dashboard: LayoutDashboardIcon,
};

export type NavIconName =
  | 'home'
  | 'chart'
  | 'accessibility'
  | 'globe'
  | 'checked'
  | 'shield'
  | 'chart-pie'
  | 'code'
  | 'sparkles'
  | 'history'
  | 'gear'
  | 'scan'
  | 'rocket'
  | 'alert'
  | 'dashboard';

interface NavIconProps extends Omit<AnimatedIconProps, 'ref'> {
  name: NavIconName;
}

export function NavIcon({ name, size = 18, className = '', ...props }: NavIconProps) {
  const Icon = ICON_MAP[name];
  return <Icon size={size} className={className} aria-hidden {...props} />;
}
