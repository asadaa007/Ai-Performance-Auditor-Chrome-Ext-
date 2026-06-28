import { AiDebugPanel } from '@popup/components/AiDebugPanel';
import { AiSettingsPanel } from '@popup/components/AiSettingsPanel';
import { APP_VERSION } from '@popup/navigation/routes';
import { ReportPageShell } from '@report/components/ReportPageShell';
import { Card, Section, Tooltip } from '@shared/components';

export function SettingsPage() {
  return (
    <ReportPageShell title="Settings" description="Extension preferences" requireAudit={false}>
      <div className="space-y-4">
        <Section title="Appearance">
          <Card className="flex items-center justify-between text-xs">
            <div>
              <p className="font-medium">Theme</p>
              <p className="text-auditor-muted">Dark mode first design system</p>
            </div>
            <Tooltip content="Light theme planned for a future release">
              <span className="text-auditor-muted">Dark</span>
            </Tooltip>
          </Card>
        </Section>

        <AiSettingsPanel />
        <AiDebugPanel />

        <Section title="About">
          <Card className="text-xs text-auditor-muted-foreground">
            <p className="font-medium text-auditor-text">AI Performance Auditor</p>
            <p className="mt-1">Analyze. Understand. Optimize.</p>
            <p className="mt-2">Version {APP_VERSION}</p>
          </Card>
        </Section>
      </div>
    </ReportPageShell>
  );
}
