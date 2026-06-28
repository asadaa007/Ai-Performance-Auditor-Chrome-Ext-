import { motion } from 'framer-motion';
import { useState } from 'react';
import type { FixAction, FixGroup, FixPlan } from '@features/fix-planner';
import { ExplainFixPanel } from '@popup/components/ExplainFixPanel';
import {
  AccordionItem,
  Badge,
  Button,
  Card,
  EmptyState,
  Section,
  StatusPill,
} from '@shared/components';

const PRIORITY_TONE = {
  Critical: 'danger',
  High: 'danger',
  Medium: 'warning',
  Low: 'neutral',
} as const;

const IMPACT_TONE = {
  'Very High': 'danger',
  High: 'warning',
  Medium: 'neutral',
  Low: 'neutral',
  Unknown: 'neutral',
} as const;

const COMPLEXITY_TONE = {
  Expert: 'danger',
  Hard: 'warning',
  Medium: 'neutral',
  Easy: 'accent',
  'Very Easy': 'accent',
} as const;

interface TopOpportunitiesPanelProps {
  fixPlan: FixPlan | null;
  limit?: number;
  auditId?: string;
}

interface ActionSelection {
  group: FixGroup;
  action: FixAction;
}

export function TopOpportunitiesPanel({
  fixPlan,
  limit = 8,
  auditId,
}: TopOpportunitiesPanelProps) {
  const [selection, setSelection] = useState<ActionSelection | null>(null);

  if (!fixPlan) {
    return null;
  }

  const groups = fixPlan.groups.slice(0, limit);

  return (
    <Section
      title="Top opportunities"
      description={`${fixPlan.actionCount} actions across ${fixPlan.groupCount} opportunity groups`}
    >
      {groups.length === 0 ? (
        <EmptyState
          title="No opportunities identified"
          description="The fix planner did not produce actions for the current audit."
          icon="✓"
        />
      ) : (
        <Card padding="sm" className="divide-y divide-auditor-border-subtle p-0">
          {groups.map((group, index) => (
            <OpportunityGroup
              key={group.id}
              group={group}
              index={index}
              onSelectAction={(action) => setSelection({ group, action })}
            />
          ))}
        </Card>
      )}

      {selection && (
        <ExplainFixPanel
          group={selection.group}
          action={selection.action}
          open={Boolean(selection)}
          onClose={() => setSelection(null)}
          auditId={auditId}
        />
      )}
    </Section>
  );
}

function OpportunityGroup({
  group,
  index,
  onSelectAction,
}: {
  group: FixGroup;
  index: number;
  onSelectAction: (action: FixAction) => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03 }}
    >
      <AccordionItem
        title={group.title}
        subtitle={`${group.actions.length} actions · ${group.framework}`}
        badge={
          <div className="flex items-center gap-1">
            <Badge tone={PRIORITY_TONE[group.priority]}>{group.priority}</Badge>
            <StatusPill
              label={`Impact: ${group.estimatedImpact}`}
              tone={IMPACT_TONE[group.estimatedImpact]}
            />
          </div>
        }
        defaultOpen={index === 0}
      >
        <div className="space-y-3 px-3 pb-3">
          <p className="text-2xs text-auditor-muted">{group.description}</p>

          <div className="flex flex-wrap gap-2">
            <StatusPill
              label={`Effort: ${group.complexity}`}
              tone={COMPLEXITY_TONE[group.complexity]}
            />
            <Badge tone="accent">{group.framework}</Badge>
          </div>

          {group.affectedResources.length > 0 && (
            <div>
              <p className="mb-1 text-2xs font-medium text-auditor-text-secondary">
                Affected resources
              </p>
              <ul className="space-y-1 font-mono text-2xs text-auditor-muted">
                {group.affectedResources.map((resource) => (
                  <li key={resource} className="truncate">
                    {resource}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <ul className="space-y-2">
            {group.actions.map((action) => (
              <li
                key={action.id}
                className="rounded-lg border border-auditor-border-subtle bg-auditor-bg-elevated p-2.5"
              >
                <div className="flex items-start justify-between gap-2">
                  <p className="text-xs font-medium text-auditor-text">{action.title}</p>
                  <Badge tone="neutral">{action.implementationType}</Badge>
                </div>
                <div className="mt-1.5 flex flex-wrap gap-2 text-2xs text-auditor-muted">
                  <span>Impact: {action.estimatedImpact}</span>
                  <span>Effort: {action.complexity}</span>
                  <span>{action.estimatedTime}</span>
                  {action.dependsOn.length > 0 && (
                    <span>Depends on {action.dependsOn.length} action(s)</span>
                  )}
                </div>
                <Button
                  size="sm"
                  className="mt-2"
                  variant="secondary"
                  onClick={() => onSelectAction(action)}
                >
                  Explain & Fix
                </Button>
              </li>
            ))}
          </ul>
        </div>
      </AccordionItem>
    </motion.div>
  );
}
