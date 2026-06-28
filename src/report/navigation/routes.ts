import type { IssueCategory } from '@features/analysis';
import type { PerformanceIssue } from '@features/analysis';
import { useMemo } from 'react';
import { useReportUiStore } from '@report/store/uiStore';

export type ReportRouteId =
  | '/'
  | '/developer'
  | '/performance'
  | '/accessibility'
  | '/seo'
  | '/best-practices'
  | '/security'
  | '/network'
  | '/resources'
  | '/images'
  | '/fonts'
  | '/javascript'
  | '/css'
  | '/dom'
  | '/storage'
  | '/third-party'
  | '/headers'
  | '/history'
  | '/settings'
  | '/ai';

export type ReportNavGroupId = 'main' | 'audit' | 'assets' | 'tools';

export interface ReportNavItem {
  id: string;
  path: ReportRouteId;
  label: string;
  icon: string;
  navGroup: ReportNavGroupId;
  category?: IssueCategory;
}

export const REPORT_NAV_GROUPS: { id: ReportNavGroupId; label: string }[] = [
  { id: 'main', label: 'Overview' },
  { id: 'audit', label: 'Audits' },
  { id: 'assets', label: 'Assets' },
  { id: 'tools', label: 'Tools' },
];

export const REPORT_NAV_ITEMS: ReportNavItem[] = [
  { id: 'overview', path: '/', label: 'Overview', icon: 'home', navGroup: 'main' },
  { id: 'developer', path: '/developer', label: 'Developer Mode', icon: 'code', navGroup: 'main' },
  { id: 'performance', path: '/performance', label: 'Performance', icon: 'chart', navGroup: 'audit', category: 'Performance' },
  { id: 'accessibility', path: '/accessibility', label: 'Accessibility', icon: 'accessibility', navGroup: 'audit', category: 'Accessibility' },
  { id: 'seo', path: '/seo', label: 'SEO', icon: 'globe', navGroup: 'audit', category: 'SEO' },
  { id: 'best-practices', path: '/best-practices', label: 'Best Practices', icon: 'checked', navGroup: 'audit', category: 'Best Practices' },
  { id: 'security', path: '/security', label: 'Security', icon: 'shield', navGroup: 'audit', category: 'Security' },
  { id: 'network', path: '/network', label: 'Network', icon: 'globe', navGroup: 'audit', category: 'Network' },
  { id: 'resources', path: '/resources', label: 'Resources', icon: 'chart-pie', navGroup: 'assets', category: 'Resources' },
  { id: 'images', path: '/images', label: 'Images', icon: 'chart-pie', navGroup: 'assets', category: 'Images' },
  { id: 'fonts', path: '/fonts', label: 'Fonts', icon: 'code', navGroup: 'assets', category: 'Fonts' },
  { id: 'javascript', path: '/javascript', label: 'JavaScript', icon: 'code', navGroup: 'assets', category: 'JavaScript' },
  { id: 'css', path: '/css', label: 'CSS', icon: 'code', navGroup: 'assets', category: 'CSS' },
  { id: 'dom', path: '/dom', label: 'DOM', icon: 'code', navGroup: 'assets', category: 'DOM' },
  { id: 'storage', path: '/storage', label: 'Storage', icon: 'chart-pie', navGroup: 'assets', category: 'Storage' },
  { id: 'third-party', path: '/third-party', label: 'Third-party', icon: 'globe', navGroup: 'assets' },
  { id: 'headers', path: '/headers', label: 'Headers', icon: 'code', navGroup: 'assets' },
  { id: 'ai', path: '/ai', label: 'AI Assistant', icon: 'sparkles', navGroup: 'tools' },
  { id: 'history', path: '/history', label: 'History', icon: 'history', navGroup: 'tools' },
  { id: 'settings', path: '/settings', label: 'Settings', icon: 'gear', navGroup: 'tools' },
];

export function filterIssues(
  issues: PerformanceIssue[],
  options: {
    searchQuery: string;
    severityFilter: string;
    categoryFilter: string;
    pinnedIds: string[];
    bookmarkedIds: string[];
    showBookmarkedOnly: boolean;
  },
): PerformanceIssue[] {
  const query = options.searchQuery.trim().toLowerCase();

  return issues
    .filter((issue) => {
      if (options.showBookmarkedOnly && !options.bookmarkedIds.includes(issue.id)) {
        return false;
      }
      if (options.severityFilter !== 'all' && issue.severity !== options.severityFilter) {
        return false;
      }
      if (options.categoryFilter !== 'all' && issue.category !== options.categoryFilter) {
        return false;
      }
      if (!query) {
        return true;
      }
      return (
        issue.title.toLowerCase().includes(query) ||
        issue.description.toLowerCase().includes(query) ||
        issue.category.toLowerCase().includes(query) ||
        issue.affectedResources.some((r) => r.toLowerCase().includes(query))
      );
    })
    .sort((a, b) => {
      const aPinned = options.pinnedIds.includes(a.id);
      const bPinned = options.pinnedIds.includes(b.id);
      if (aPinned !== bPinned) {
        return aPinned ? -1 : 1;
      }
      return 0;
    });
}

export function useFilteredIssues(issues: PerformanceIssue[]): PerformanceIssue[] {
  const searchQuery = useReportUiStore((s) => s.searchQuery);
  const severityFilter = useReportUiStore((s) => s.severityFilter);
  const categoryFilter = useReportUiStore((s) => s.categoryFilter);
  const pinnedIds = useReportUiStore((s) => s.pinnedIssueIds);
  const bookmarkedIds = useReportUiStore((s) => s.bookmarkedIssueIds);
  const showBookmarkedOnly = useReportUiStore((s) => s.showBookmarkedOnly);

  return useMemo(
    () =>
      filterIssues(issues, {
        searchQuery,
        severityFilter,
        categoryFilter,
        pinnedIds,
        bookmarkedIds,
        showBookmarkedOnly,
      }),
    [issues, searchQuery, severityFilter, categoryFilter, pinnedIds, bookmarkedIds, showBookmarkedOnly],
  );
}
