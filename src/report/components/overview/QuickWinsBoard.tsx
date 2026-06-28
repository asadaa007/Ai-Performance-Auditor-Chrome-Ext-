import { useState } from 'react';
import type { FixAction, FixGroup, FixPlan } from '@features/fix-planner';
import { ExplainFixPanel } from '@popup/components/ExplainFixPanel';
import { Badge, Button, Card } from '@shared/components';
import { DashboardSection } from '@report/components/overview/DashboardSection';

interface QuickWinsBoardProps {
  fixPlan: FixPlan | null;
  auditId?: string;
  limit?: number;
}

const PRIORITY_TONE = {
  Critical: 'danger',
  High: 'warning',
  Medium: 'neutral',
  Low: 'neutral',
} as const;

export function QuickWinsBoard({ fixPlan, auditId, limit = 6 }: QuickWinsBoardProps) {
  const [selection, setSelection] = useState<{
    group: FixGroup;
    action: FixAction;
  } | null>(null);

  if (!fixPlan || fixPlan.groups.length === 0) {
    return null;
  }

  const actions = fixPlan.groups
    .flatMap((group) =>
      group.actions.map((action) => ({
        group,
        action,
      })),
    )
    .slice(0, limit);

  return (
    <>
      <DashboardSection
        icon="sparkles"
        title="Quick wins"
        subtitle={`${fixPlan.actionCount} prioritized fixes from the fix planner — highest impact actions first`}
      >
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
          {actions.map(({ group, action }) => (
            <Card
              key={action.id}
              variant="elevated"
              className="flex flex-col justify-between gap-3"
            >
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-1.5">
                  <Badge tone={PRIORITY_TONE[action.priority] ?? 'neutral'}>
                    {action.priority}
                  </Badge>
                  <Badge tone="accent">{action.estimatedImpact} impact</Badge>
                  <span className="text-3xs text-auditor-muted">{action.complexity}</span>
                </div>
                <p className="text-sm font-medium leading-snug text-auditor-text">{action.title}</p>
                <p className="text-2xs leading-relaxed text-auditor-muted">{group.title}</p>
                <p className="font-mono text-3xs text-auditor-muted">
                  ~{action.estimatedTime} · {action.implementationType}
                </p>
              </div>
              <Button
                size="sm"
                variant="secondary"
                className="w-full"
                onClick={() => setSelection({ group, action })}
              >
                Explain & Fix
              </Button>
            </Card>
          ))}
        </div>
      </DashboardSection>

      {selection && (
        <ExplainFixPanel
          open
          auditId={auditId}
          group={selection.group}
          action={selection.action}
          onClose={() => setSelection(null)}
        />
      )}
    </>
  );
}
