import type { IssueCategory } from '@features/analysis';
import { useMemo } from 'react';
import { IssueFilters } from '@report/components/IssueFilters';
import { VirtualIssueList } from '@report/components/IssueCard';
import { ReportPageShell } from '@report/components/ReportPageShell';
import { useFilteredIssues } from '@report/navigation/routes';
import { useSnapshotData } from '@report/hooks/useSnapshotData';

interface CategoryIssuesPageProps {
  title: string;
  description: string;
  category?: IssueCategory;
}

export function CategoryIssuesPage({ title, description, category }: CategoryIssuesPageProps) {
  return (
    <ReportPageShell title={title} description={description}>
      {() => <CategoryIssuesContent category={category} />}
    </ReportPageShell>
  );
}

function CategoryIssuesContent({ category }: { category?: IssueCategory }) {
  const { analysis } = useSnapshotData();
  const baseIssues = useMemo(() => {
    if (!analysis) {
      return [];
    }
    return category
      ? analysis.issues.filter((issue) => issue.category === category)
      : analysis.issues;
  }, [analysis, category]);
  const issues = useFilteredIssues(baseIssues);

  return (
    <div className="space-y-4">
      <IssueFilters />
      <VirtualIssueList issues={issues} />
    </div>
  );
}
