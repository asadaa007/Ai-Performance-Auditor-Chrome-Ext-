import type { IssueCategory, IssueSeverity } from '@features/analysis';
import type { ReportNavGroupId } from '@report/navigation/routes';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface ReportUiState {
  searchQuery: string;
  severityFilter: IssueSeverity | 'all';
  categoryFilter: IssueCategory | 'all';
  pinnedIssueIds: string[];
  bookmarkedIssueIds: string[];
  showBookmarkedOnly: boolean;
  collapsedSections: Record<string, boolean>;
  sidebarWidth: number;
  sidebarCollapsed: boolean;
  activeNavGroup: ReportNavGroupId;
  commandPaletteOpen: boolean;
  setSearchQuery: (query: string) => void;
  setSeverityFilter: (severity: IssueSeverity | 'all') => void;
  setCategoryFilter: (category: IssueCategory | 'all') => void;
  togglePinned: (issueId: string) => void;
  toggleBookmarked: (issueId: string) => void;
  setShowBookmarkedOnly: (show: boolean) => void;
  toggleSection: (sectionId: string) => void;
  setSidebarWidth: (width: number) => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  setActiveNavGroup: (group: ReportNavGroupId) => void;
  setCommandPaletteOpen: (open: boolean) => void;
}

export const useReportUiStore = create<ReportUiState>()(
  persist(
    (set, get) => ({
      searchQuery: '',
      severityFilter: 'all',
      categoryFilter: 'all',
      pinnedIssueIds: [],
      bookmarkedIssueIds: [],
      showBookmarkedOnly: false,
      collapsedSections: {},
      sidebarWidth: 248,
      sidebarCollapsed: false,
      activeNavGroup: 'main',
      commandPaletteOpen: false,
      setSearchQuery: (searchQuery) => set({ searchQuery }),
      setSeverityFilter: (severityFilter) => set({ severityFilter }),
      setCategoryFilter: (categoryFilter) => set({ categoryFilter }),
      togglePinned: (issueId) => {
        const current = get().pinnedIssueIds;
        set({
          pinnedIssueIds: current.includes(issueId)
            ? current.filter((id) => id !== issueId)
            : [...current, issueId],
        });
      },
      toggleBookmarked: (issueId) => {
        const current = get().bookmarkedIssueIds;
        set({
          bookmarkedIssueIds: current.includes(issueId)
            ? current.filter((id) => id !== issueId)
            : [...current, issueId],
        });
      },
      setShowBookmarkedOnly: (showBookmarkedOnly) => set({ showBookmarkedOnly }),
      toggleSection: (sectionId) => {
        const current = get().collapsedSections;
        set({
          collapsedSections: {
            ...current,
            [sectionId]: !current[sectionId],
          },
        });
      },
      setSidebarWidth: (sidebarWidth) => set({ sidebarWidth }),
      setSidebarCollapsed: (sidebarCollapsed) => set({ sidebarCollapsed }),
      setActiveNavGroup: (activeNavGroup) => set({ activeNavGroup, sidebarCollapsed: false }),
      setCommandPaletteOpen: (commandPaletteOpen) => set({ commandPaletteOpen }),
    }),
    {
      name: 'apa-report-ui',
      partialize: (state) => ({
        pinnedIssueIds: state.pinnedIssueIds,
        bookmarkedIssueIds: state.bookmarkedIssueIds,
        collapsedSections: state.collapsedSections,
        sidebarWidth: state.sidebarWidth,
        sidebarCollapsed: state.sidebarCollapsed,
        activeNavGroup: state.activeNavGroup,
      }),
    },
  ),
);
