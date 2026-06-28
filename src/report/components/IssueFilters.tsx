import type { IssueCategory, IssueSeverity } from '@features/analysis';
import { useReportUiStore } from '@report/store/uiStore';
import { Button } from '@shared/components';

const SEVERITIES: Array<IssueSeverity | 'all'> = [
  'all',
  'Critical',
  'High',
  'Medium',
  'Low',
  'Info',
];

const CATEGORIES: Array<IssueCategory | 'all'> = [
  'all',
  'Performance',
  'Accessibility',
  'SEO',
  'Security',
  'Network',
  'Resources',
  'Images',
  'JavaScript',
  'CSS',
  'DOM',
];

export function IssueFilters() {
  const searchQuery = useReportUiStore((s) => s.searchQuery);
  const severityFilter = useReportUiStore((s) => s.severityFilter);
  const categoryFilter = useReportUiStore((s) => s.categoryFilter);
  const showBookmarkedOnly = useReportUiStore((s) => s.showBookmarkedOnly);
  const bookmarkedCount = useReportUiStore((s) => s.bookmarkedIssueIds.length);
  const setSearchQuery = useReportUiStore((s) => s.setSearchQuery);
  const setSeverityFilter = useReportUiStore((s) => s.setSeverityFilter);
  const setCategoryFilter = useReportUiStore((s) => s.setCategoryFilter);
  const setShowBookmarkedOnly = useReportUiStore((s) => s.setShowBookmarkedOnly);

  return (
    <div
      className="report-no-print flex flex-wrap items-end gap-3 rounded-xl border border-auditor-border-subtle bg-auditor-surface/50 p-4"
      role="search"
      aria-label="Filter issues"
    >
      <label className="min-w-[200px] flex-1 space-y-1.5">
        <span className="text-2xs font-medium uppercase tracking-wide text-auditor-muted">
          Search
        </span>
        <input
          value={searchQuery}
          onChange={(event) => setSearchQuery(event.target.value)}
          placeholder="Search by title, category, or resource…"
          className="form-control w-full"
        />
      </label>
      <label className="space-y-1.5">
        <span className="text-2xs font-medium uppercase tracking-wide text-auditor-muted">
          Severity
        </span>
        <select
          value={severityFilter}
          onChange={(event) => setSeverityFilter(event.target.value as IssueSeverity | 'all')}
          className="form-control"
        >
          {SEVERITIES.map((severity) => (
            <option key={severity} value={severity}>
              {severity === 'all' ? 'All severities' : severity}
            </option>
          ))}
        </select>
      </label>
      <label className="space-y-1.5">
        <span className="text-2xs font-medium uppercase tracking-wide text-auditor-muted">
          Category
        </span>
        <select
          value={categoryFilter}
          onChange={(event) => setCategoryFilter(event.target.value as IssueCategory | 'all')}
          className="form-control"
        >
          {CATEGORIES.map((category) => (
            <option key={category} value={category}>
              {category === 'all' ? 'All categories' : category}
            </option>
          ))}
        </select>
      </label>
      <div className="flex flex-wrap gap-2">
        <Button
          size="sm"
          variant={showBookmarkedOnly ? 'primary' : 'secondary'}
          onClick={() => setShowBookmarkedOnly(!showBookmarkedOnly)}
          aria-pressed={showBookmarkedOnly}
        >
          Bookmarked{bookmarkedCount > 0 ? ` (${bookmarkedCount})` : ''}
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => {
            setSearchQuery('');
            setSeverityFilter('all');
            setCategoryFilter('all');
            setShowBookmarkedOnly(false);
          }}
        >
          Reset
        </Button>
      </div>
    </div>
  );
}
