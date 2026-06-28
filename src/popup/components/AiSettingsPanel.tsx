import { useEffect } from 'react';
import type { ProviderType } from '@features/ai';
import { mapAIError } from '@features/ai';
import { AiErrorDisplay } from '@popup/components/AiErrorDisplay';
import { useAiSettings } from '@popup/hooks/useAiSettings';
import { Badge, Button, Card, Section, Skeleton } from '@shared/components';

export function AiSettingsPanel() {
  const {
    config,
    models,
    apiKeyDraft,
    setApiKeyDraft,
    isEditingKey,
    setIsEditingKey,
    isLoading,
    isTesting,
    testResult,
    error,
    providerLabels,
    saveConfig,
    saveApiKey,
    testConnection,
    loadModels,
    updateProvider,
  } = useAiSettings();

  useEffect(() => {
    if (config?.provider) {
      void loadModels(config.provider);
    }
  }, [config?.provider, loadModels]);

  if (isLoading || !config) {
    return (
      <Section title="AI Provider">
        <Skeleton className="h-40" />
      </Section>
    );
  }

  return (
    <Section title="AI Provider" description="Configure a provider for future AI analysis features">
      <Card className="space-y-4 text-xs">
        <Field label="Provider">
          <select
            value={config.provider}
            onChange={(event) => void updateProvider(event.target.value as ProviderType)}
            className="h-8 w-full rounded-lg border border-auditor-border bg-auditor-bg-elevated px-2 text-auditor-text"
          >
            {Object.entries(providerLabels).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Model">
          <select
            value={config.model}
            onChange={(event) => void saveConfig({ model: event.target.value })}
            className="h-8 w-full rounded-lg border border-auditor-border bg-auditor-bg-elevated px-2 text-auditor-text"
          >
            {(models.length > 0
              ? models
              : [{ id: config.model, name: config.model, provider: config.provider }]
            ).map((model) => (
              <option key={model.id} value={model.id}>
                {model.name}
              </option>
            ))}
          </select>
        </Field>

        {config.provider !== 'ollama' ? (
          <Field label="API key">
            {isEditingKey ? (
              <div className="space-y-2">
                <input
                  type="password"
                  value={apiKeyDraft}
                  onChange={(event) => setApiKeyDraft(event.target.value)}
                  placeholder={
                    config.provider === 'cursor' ? 'crsr_…' : 'Enter API key'
                  }
                  className="h-8 w-full rounded-lg border border-auditor-border bg-auditor-bg-elevated px-2 text-auditor-text"
                />
                <p className="text-2xs text-auditor-muted">
                  {config.provider === 'cursor'
                    ? 'Create a key at cursor.com/dashboard → API Keys. Explain uses Cloud Agents — enable Privacy Mode (with storage), not Legacy/Ghost, in Cursor settings.'
                    : 'Keys are stored in chrome.storage.local only after you save.'}
                </p>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={() => void saveApiKey()}
                    disabled={!apiKeyDraft.trim()}
                  >
                    Save API key
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      setApiKeyDraft('');
                      setIsEditingKey(false);
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between rounded-lg border border-auditor-border-subtle bg-auditor-bg-elevated px-3 py-2 font-mono text-2xs text-auditor-muted">
                <span>{config.hasApiKey ? config.apiKeyMasked : 'No key stored'}</span>
                <Button size="sm" variant="ghost" onClick={() => setIsEditingKey(true)}>
                  Edit
                </Button>
              </div>
            )}
          </Field>
        ) : (
          <Field label="Ollama base URL">
            <input
              type="url"
              value={config.ollamaBaseUrl}
              onChange={(event) => void saveConfig({ ollamaBaseUrl: event.target.value })}
              className="h-8 w-full rounded-lg border border-auditor-border bg-auditor-bg-elevated px-2 text-auditor-text"
            />
          </Field>
        )}

        <div className="grid grid-cols-2 gap-3">
          <Field label="Temperature">
            <input
              type="number"
              min={0}
              max={2}
              step={0.1}
              value={config.temperature}
              onChange={(event) => void saveConfig({ temperature: Number(event.target.value) })}
              className="h-8 w-full rounded-lg border border-auditor-border bg-auditor-bg-elevated px-2"
            />
          </Field>
          <Field label="Max tokens">
            <input
              type="number"
              min={256}
              max={16384}
              step={256}
              value={config.maxTokens}
              onChange={(event) => void saveConfig({ maxTokens: Number(event.target.value) })}
              className="h-8 w-full rounded-lg border border-auditor-border bg-auditor-bg-elevated px-2"
            />
          </Field>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button size="sm" onClick={() => void testConnection()} disabled={isTesting}>
            {isTesting ? 'Testing…' : 'Test connection'}
          </Button>
        </div>

        {testResult && !testResult.healthy && (
          <AiErrorDisplay
            error={mapAIError(testResult.message)}
            onRetry={() => void testConnection()}
          />
        )}

        {testResult?.healthy && (
          <div className="rounded-lg border border-auditor-success/30 bg-auditor-success-muted p-3">
            <div className="flex items-center gap-2">
              <Badge tone="success">Connected</Badge>
              <span className="text-auditor-muted">{testResult.latencyMs} ms</span>
            </div>
            <p className="mt-1 text-auditor-text-secondary">{testResult.message}</p>
          </div>
        )}

        {error && <AiErrorDisplay error={mapAIError(error)} />}
      </Card>
    </Section>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block space-y-1.5">
      <span className="text-auditor-muted">{label}</span>
      {children}
    </label>
  );
}
