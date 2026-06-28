import { CategoryIssuesPage } from '@report/pages/CategoryIssuesPage';

export function SeoPage() {
  return (
    <CategoryIssuesPage
      title="SEO"
      description="Search optimization issues and metadata gaps"
      category="SEO"
    />
  );
}

export function BestPracticesPage() {
  return (
    <CategoryIssuesPage
      title="Best Practices"
      description="Modern web best-practice violations"
      category="Best Practices"
    />
  );
}

export function SecurityPage() {
  return (
    <CategoryIssuesPage
      title="Security"
      description="Security-related findings from the audit"
      category="Security"
    />
  );
}

export function NetworkPage() {
  return (
    <CategoryIssuesPage
      title="Network"
      description="Network timing, protocol, and request issues"
      category="Network"
    />
  );
}

export function FontsPage() {
  return (
    <CategoryIssuesPage
      title="Fonts"
      description="Font loading and webfont performance issues"
      category="Fonts"
    />
  );
}

export function StoragePage() {
  return (
    <CategoryIssuesPage
      title="Storage"
      description="Storage usage and persistence findings"
      category="Storage"
    />
  );
}
