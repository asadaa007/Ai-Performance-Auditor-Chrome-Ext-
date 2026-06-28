import type { FixPlan } from '@features/fix-planner';
import type { AuditResult } from '@shared/types';
import { Card } from '@shared/components';
import { NavIcon } from '@shared/components/NavIcon';
import { formatBytes, formatNumber } from '@shared/utils';
import { DashboardSection } from '@report/components/overview/DashboardSection';

interface TechnicalSnapshotProps {
  result: AuditResult;
  fixPlan: FixPlan | null;
}

export function TechnicalSnapshot({ result, fixPlan }: TechnicalSnapshotProps) {
  const profile = fixPlan?.frameworkProfile;

  const tiles = [
    {
      label: 'Collection time',
      value: formatNumber(result.meta.collectionDurationMs),
      unit: 'ms',
      icon: 'history' as const,
    },
    {
      label: 'Network requests',
      value: formatNumber(result.resources.totalRequests),
      icon: 'globe' as const,
    },
    {
      label: 'Transfer size',
      value: formatBytes(result.resources.totalTransferSize),
      icon: 'chart' as const,
    },
    {
      label: 'DOM nodes',
      value: formatNumber(result.dom.totalNodes),
      icon: 'code' as const,
    },
    {
      label: 'Scripts',
      value: formatNumber(result.javascript.totalScripts),
      icon: 'code' as const,
    },
    {
      label: 'Images',
      value: formatNumber(result.images.totalImages),
      icon: 'chart-pie' as const,
    },
  ];

  return (
    <DashboardSection
      icon="code"
      title="Technical snapshot"
      subtitle="Raw counts from collectors — use category tabs for deep dives"
    >
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 2xl:grid-cols-6">
        {tiles.map((tile) => (
          <Card key={tile.label} variant="elevated" padding="sm">
            <NavIcon name={tile.icon} size={16} className="text-auditor-muted" />
            <p className="mt-2 text-3xs uppercase tracking-wider text-auditor-muted">{tile.label}</p>
            <p className="mt-1 text-lg font-bold tabular-nums text-auditor-text">
              {tile.value}
              {tile.unit && (
                <span className="ml-1 text-xs font-normal text-auditor-muted">{tile.unit}</span>
              )}
            </p>
          </Card>
        ))}
      </div>

      {profile && (
        <Card variant="glass" className="mt-3 grid gap-4 md:grid-cols-4">
          <div>
            <p className="text-3xs uppercase tracking-wider text-auditor-muted">Stack detected</p>
            <p className="mt-1 text-sm font-medium text-auditor-text">{profile.primaryFramework}</p>
          </div>
          <div>
            <p className="text-3xs uppercase tracking-wider text-auditor-muted">UI / CSS</p>
            <p className="mt-1 text-sm text-auditor-text-secondary">
              {[profile.uiLibrary, profile.cssFramework].filter(Boolean).join(' · ') || 'Unknown'}
            </p>
          </div>
          <div>
            <p className="text-3xs uppercase tracking-wider text-auditor-muted">CMS / build</p>
            <p className="mt-1 text-sm text-auditor-text-secondary">
              {[profile.cms, profile.buildTool].filter(Boolean).join(' · ') || 'N/A'}
            </p>
          </div>
          <div>
            <p className="text-3xs uppercase tracking-wider text-auditor-muted">Confidence</p>
            <p className="mt-1 text-sm font-medium text-auditor-text">
              {Math.round(profile.confidence * 100)}%
            </p>
          </div>
        </Card>
      )}
    </DashboardSection>
  );
}
