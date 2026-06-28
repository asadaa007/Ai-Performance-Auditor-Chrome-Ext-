import type { PerformanceIssue, IssueCategory, IssueSeverity } from '@features/analysis';
import type {
  ExplainLayersInput,
  ExplainMetric,
  ExplainPromptContext,
} from '@features/ai-explain/types';
import type {
  FixAction,
  FixGroup,
  FixPerformanceImpact,
  FixPriority,
  ImplementationType,
} from '@features/fix-planner';
import type { AuditResult } from '@shared/types';
import { displayValue, formatBytes, formatNumber } from '@shared/utils';

const MAX_RESOURCES = 6;
const MAX_METRICS = 8;

/** Sentinel group id when explaining an issue directly (no fix-plan group). */
export const ISSUE_DIRECT_GROUP_ID = 'issue-direct';

export class ExplainContextBuilder {
  build(input: ExplainLayersInput): ExplainPromptContext {
    const issue = this.requireIssue(input.analysis.issues, input.issueId);
    const { group, action } = this.resolveGroupAndAction(input, issue);

    return {
      siteUrl: input.audit.meta.url,
      frameworkProfile: input.fixPlan.frameworkProfile,
      issue,
      fixAction: action,
      fixGroup: {
        id: group.id,
        title: group.title,
        description: group.description,
        priority: group.priority,
        estimatedImpact: group.estimatedImpact,
        complexity: group.complexity,
      },
      relevantMetrics: this.buildRelevantMetrics(input.audit, issue),
      relevantResources: this.buildRelevantResources(issue, action, group),
    };
  }

  private resolveGroupAndAction(
    input: ExplainLayersInput,
    issue: PerformanceIssue,
  ): { group: FixGroup; action: FixAction } {
    if (input.groupId === ISSUE_DIRECT_GROUP_ID) {
      const action = this.buildDirectIssueAction(issue);
      const group = this.buildDirectIssueGroup(issue, action);
      return { group, action };
    }

    const group = this.requireGroup(input);
    const action = this.requireAction(group, input.actionId);
    return { group, action };
  }

  private buildDirectIssueGroup(issue: PerformanceIssue, action: FixAction): FixGroup {
    return {
      id: ISSUE_DIRECT_GROUP_ID,
      title: issue.title,
      description: issue.description,
      priority: severityToPriority(issue.severity),
      estimatedImpact: impactToFixImpact(issue.impact),
      complexity: 'Medium',
      framework: 'General',
      affectedResources: issue.affectedResources,
      actions: [action],
    };
  }

  private buildDirectIssueAction(issue: PerformanceIssue): FixAction {
    return {
      id: issue.id,
      title: `Resolve: ${issue.title}`,
      category: issue.category,
      priority: severityToPriority(issue.severity),
      complexity: 'Medium',
      estimatedTime: issue.estimatedTimeToFix,
      estimatedImpact: impactToFixImpact(issue.impact),
      frameworkSpecific: false,
      requiresDeveloper: issue.category !== 'SEO',
      manualVerification: true,
      relatedIssues: [issue.id],
      affectedResources: issue.affectedResources,
      implementationType: categoryToImplementation(issue.category),
      dependsOn: [],
    };
  }

  private requireGroup(input: ExplainLayersInput): FixGroup {
    const group = input.fixPlan.groups.find((item) => item.id === input.groupId);
    if (!group) {
      throw new Error(`Fix group not found: ${input.groupId}`);
    }
    return group;
  }

  private requireAction(group: FixGroup, actionId: string): FixAction {
    const action = group.actions.find((item) => item.id === actionId);
    if (!action) {
      throw new Error(`Fix action not found: ${actionId}`);
    }
    return action;
  }

  private requireIssue(issues: PerformanceIssue[], issueId: string): PerformanceIssue {
    const issue = issues.find((item) => item.id === issueId);
    if (!issue) {
      throw new Error(`Performance issue not found: ${issueId}`);
    }
    return issue;
  }

  private buildRelevantMetrics(audit: AuditResult, issue: PerformanceIssue): ExplainMetric[] {
    const metrics: ExplainMetric[] = [];

    const add = (label: string, value: string) => {
      if (metrics.length < MAX_METRICS) {
        metrics.push({ label, value });
      }
    };

    switch (issue.category) {
      case 'Performance':
        add('LCP', displayValue(audit.webVitals.lcp));
        add('CLS', displayValue(audit.webVitals.cls));
        add('INP', displayValue(audit.webVitals.inp));
        add('FCP', displayValue(audit.webVitals.fcp));
        add('TTFB', displayValue(audit.webVitals.ttfb));
        break;
      case 'Images':
        add('Total images', formatNumber(audit.images.totalImages));
        add('Oversized images', formatNumber(audit.images.oversizedCount));
        add('Missing dimensions', formatNumber(audit.images.missingDimensionsCount));
        add(
          'Without lazy load',
          formatNumber(audit.images.totalImages - audit.images.lazyLoadedCount),
        );
        break;
      case 'CSS':
        add('Stylesheets', formatNumber(audit.css.totalStylesheets));
        add('Inline styles', formatNumber(audit.css.inlineStyleBlocks));
        break;
      case 'JavaScript':
        add('Scripts', formatNumber(audit.javascript.totalScripts));
        add('Third-party scripts', formatNumber(audit.javascript.thirdPartyScripts));
        add('Module scripts', formatNumber(audit.javascript.moduleScripts));
        break;
      case 'Fonts':
        add('Font families', formatNumber(audit.fonts.fontFamilies.length));
        add('Preloaded fonts', formatNumber(audit.fonts.preloadedFonts.length));
        break;
      case 'DOM':
        add('DOM nodes', formatNumber(audit.dom.totalNodes));
        add('DOM depth', formatNumber(audit.dom.maxDepth));
        break;
      case 'SEO':
        add('Title', audit.metaTags.title ?? 'missing');
        add('Description', audit.metaTags.description ? 'present' : 'missing');
        add('Canonical', audit.metaTags.canonicalUrl ?? 'missing');
        break;
      case 'Accessibility':
        add('Missing alt text', formatNumber(audit.accessibility.missingAltCount));
        add('Missing form labels', formatNumber(audit.accessibility.missingFormLabelsCount));
        add('Missing lang', audit.accessibility.hasLangAttribute ? 'present' : 'missing');
        break;
      case 'Network':
      case 'Resources':
        add('Requests', formatNumber(audit.resources.totalRequests));
        add('Transfer size', formatBytes(audit.resources.totalTransferSize));
        add('Third-party requests', formatNumber(audit.thirdParty.thirdPartyRequestCount));
        break;
      case 'Storage':
        add('Cookies', formatNumber(audit.storage.cookies.count));
        add('localStorage keys', formatNumber(audit.storage.localStorage.keyCount));
        add('sessionStorage keys', formatNumber(audit.storage.sessionStorage.keyCount));
        break;
      default:
        add('LCP', displayValue(audit.webVitals.lcp));
        add('Transfer size', formatBytes(audit.resources.totalTransferSize));
    }

    if (issue.metric) {
      add(issue.metric, String(issue.currentValue ?? 'n/a'));
    }

    return metrics.slice(0, MAX_METRICS);
  }

  private buildRelevantResources(
    issue: PerformanceIssue,
    action: FixAction,
    group: FixGroup,
  ): string[] {
    return [
      ...new Set([
        ...issue.affectedResources,
        ...action.affectedResources,
        ...group.affectedResources,
      ]),
    ].slice(0, MAX_RESOURCES);
  }
}

function severityToPriority(severity: IssueSeverity): FixPriority {
  switch (severity) {
    case 'Critical':
      return 'Critical';
    case 'High':
      return 'High';
    case 'Medium':
      return 'Medium';
    case 'Low':
    case 'Info':
    default:
      return 'Low';
  }
}

function impactToFixImpact(impact: PerformanceIssue['impact']): FixPerformanceImpact {
  if (impact === 'Very High' || impact === 'High' || impact === 'Medium' || impact === 'Low') {
    return impact;
  }
  return 'Unknown';
}

function categoryToImplementation(category: IssueCategory): ImplementationType {
  switch (category) {
    case 'CSS':
      return 'CSS';
    case 'JavaScript':
      return 'JavaScript';
    case 'Images':
      return 'Image Optimization';
    case 'Accessibility':
    case 'SEO':
    case 'DOM':
      return 'HTML';
    case 'Network':
    case 'Resources':
      return 'CDN';
    case 'Storage':
      return 'Server Configuration';
    default:
      return 'HTML';
  }
}

export const explainContextBuilder = new ExplainContextBuilder();
