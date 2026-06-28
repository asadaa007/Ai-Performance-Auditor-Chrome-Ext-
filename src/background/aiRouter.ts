import { aiService } from '@features/ai';
import type {
  ListAiModelsPayload,
  SaveAiConfigPayload,
  TestAiConnectionPayload,
} from '@shared/messaging';
import { wrapHandler } from '@background/auditOrchestrator';
import type { MessageBus } from '@shared/messaging';

export function registerAiRouter(bus: MessageBus): void {
  bus.on(
    'GET_AI_CONFIG',
    wrapHandler(async () => ({
      config: await aiService.getPublicConfig(),
    })),
  );

  bus.on(
    'SAVE_AI_CONFIG',
    wrapHandler(async (payload: SaveAiConfigPayload) => {
      await aiService.saveConfig(payload);
      return { config: await aiService.getPublicConfig() };
    }),
  );

  bus.on(
    'TEST_AI_CONNECTION',
    wrapHandler(async (payload: TestAiConnectionPayload) => {
      const result = await aiService.testConnection(payload);
      return { result };
    }),
  );

  bus.on(
    'GET_AI_DEBUG_INFO',
    wrapHandler(async () => {
      const diagnostics = await aiService.getDiagnostics();
      const connectionStatus = diagnostics.lastTest
        ? diagnostics.lastTest.healthy
          ? 'connected'
          : 'error'
        : 'unknown';
      return { diagnostics, connectionStatus };
    }),
  );

  bus.on(
    'LIST_AI_MODELS',
    wrapHandler(async (payload: ListAiModelsPayload) => {
      const models = await aiService.listModels(payload);
      return { models };
    }),
  );
}
