import { useCallback, useEffect, useState } from 'react';
import {
  DEFAULT_MODELS,
  PROVIDER_LABELS,
  type AIModel,
  type HealthCheckResult,
  type ProviderType,
  type PublicAIConfig,
} from '@features/ai';
import { getPopupMessageBus } from '@popup/messaging/popupBus';
import {
  auditErrorFromSerialized,
  isErrorResponse,
  type SerializedAuditError,
} from '@shared/errors';
import type {
  GetAiConfigResponsePayload,
  ListAiModelsResponsePayload,
  SaveAiConfigPayload,
  SaveAiConfigResponsePayload,
  TestAiConnectionResponsePayload,
} from '@shared/messaging';

function unwrapRpcResponse<T>(response: T | { error: SerializedAuditError }): T {
  if (isErrorResponse(response)) {
    throw auditErrorFromSerialized(response.error);
  }
  return response;
}

export function useAiSettings() {
  const [config, setConfig] = useState<PublicAIConfig | null>(null);
  const [models, setModels] = useState<AIModel[]>([]);
  const [apiKeyDraft, setApiKeyDraft] = useState('');
  const [isEditingKey, setIsEditingKey] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<HealthCheckResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const bus = getPopupMessageBus();

  const loadConfig = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = unwrapRpcResponse(
        await bus.send<
          Record<string, never>,
          GetAiConfigResponsePayload | { error: SerializedAuditError }
        >({
          type: 'GET_AI_CONFIG',
          payload: {},
          target: 'background',
        }),
      );

      setConfig(response.config);
      setApiKeyDraft('');
      setIsEditingKey(false);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : String(caught));
    } finally {
      setIsLoading(false);
    }
  }, [bus]);

  useEffect(() => {
    void loadConfig();
  }, [loadConfig]);

  const saveConfig = useCallback(
    async (partial: SaveAiConfigPayload) => {
      setError(null);
      const payload: SaveAiConfigPayload = { ...partial };

      if (partial.apiKey === undefined && isEditingKey && apiKeyDraft.trim()) {
        payload.apiKey = apiKeyDraft.trim();
      } else if (typeof partial.apiKey === 'string') {
        payload.apiKey = partial.apiKey.trim();
      }

      const response = unwrapRpcResponse(
        await bus.send<
          SaveAiConfigPayload,
          SaveAiConfigResponsePayload | { error: SerializedAuditError }
        >({
          type: 'SAVE_AI_CONFIG',
          payload,
          target: 'background',
        }),
      );

      setConfig(response.config);
      setApiKeyDraft('');
      setIsEditingKey(false);
    },
    [apiKeyDraft, bus, isEditingKey],
  );

  const saveApiKey = useCallback(async () => {
    const trimmed = apiKeyDraft.trim();
    if (!trimmed) {
      setError('Enter an API key before saving.');
      return;
    }

    await saveConfig({ apiKey: trimmed });
  }, [apiKeyDraft, saveConfig]);

  const testConnection = useCallback(async () => {
    if (!config) {
      return;
    }

    setIsTesting(true);
    setError(null);
    setTestResult(null);

    try {
      if (isEditingKey && apiKeyDraft.trim()) {
        await saveConfig({ apiKey: apiKeyDraft.trim() });
      }

      const response = unwrapRpcResponse(
        await bus.send<
          SaveAiConfigPayload,
          TestAiConnectionResponsePayload | { error: SerializedAuditError }
        >({
          type: 'TEST_AI_CONNECTION',
          payload: {
            provider: config.provider,
            model: config.model,
            temperature: config.temperature,
            maxTokens: config.maxTokens,
            ollamaBaseUrl: config.ollamaBaseUrl,
          },
          target: 'background',
        }),
      );

      setTestResult(response.result);
      await loadConfig();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : String(caught));
    } finally {
      setIsTesting(false);
    }
  }, [apiKeyDraft, bus, config, isEditingKey, loadConfig, saveConfig]);

  const loadModels = useCallback(
    async (provider: ProviderType) => {
      const response = await bus.send<
        { provider: ProviderType; apiKey?: string; ollamaBaseUrl?: string },
        ListAiModelsResponsePayload | { error: SerializedAuditError }
      >({
        type: 'LIST_AI_MODELS',
        payload: {
          provider,
          ...(isEditingKey && apiKeyDraft ? { apiKey: apiKeyDraft } : {}),
        },
        target: 'background',
      });

      if (isErrorResponse(response)) {
        return [{ id: DEFAULT_MODELS[provider], name: DEFAULT_MODELS[provider], provider }];
      }

      const modelsResponse = unwrapRpcResponse(response);
      setModels(modelsResponse.models);
      return modelsResponse.models;
    },
    [apiKeyDraft, bus, isEditingKey],
  );

  const updateProvider = useCallback(
    async (provider: ProviderType) => {
      if (!config) {
        return;
      }

      const nextModel = DEFAULT_MODELS[provider];
      await saveConfig({ provider, model: nextModel });
      const loaded = await loadModels(provider);
      if (loaded.length > 0) {
        await saveConfig({ model: loaded[0].id });
      }
    },
    [config, loadModels, saveConfig],
  );

  return {
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
    providerLabels: PROVIDER_LABELS,
    saveConfig,
    saveApiKey,
    testConnection,
    loadModels,
    updateProvider,
    reload: loadConfig,
  };
}
