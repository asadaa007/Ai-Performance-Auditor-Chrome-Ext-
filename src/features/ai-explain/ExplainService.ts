import { analysisEngine } from '@features/analysis';
import { aiService } from '@features/ai/services/AIService';
import { promptBuilder } from '@features/ai/prompt/PromptBuilder';
import { apiKeyManager } from '@features/ai/storage/ApiKeyManager';
import { estimateRequestTokens } from '@features/ai/utils/tokenEstimator';
import { simulateStream } from '@features/ai/utils/sseReader';
import { explainContextBuilder } from '@features/ai-explain/ExplainContextBuilder';
import { buildExplainUserPrompt } from '@features/ai-explain/prompt/buildExplainUserPrompt';
import {
  buildExplainSystemPrompt,
  resolveExplainTemplate,
} from '@features/ai-explain/prompt/explainSystemPrompt';
import { explainCache, explainHistory } from '@features/ai-explain/storage/ExplainStorage';
import type {
  ExplainCacheStatus,
  ExplainHistoryEntry,
  ExplainLayersInput,
} from '@features/ai-explain/types';
import { hashExplainPrompt } from '@features/ai-explain/utils/promptHash';
import { fixPlanner } from '@features/fix-planner';
import type { AIRequest, AIResponse } from '@features/ai/types';
import type { StreamChunk } from '@features/ai/types/response';
import type { ProviderType } from '@features/ai/types/provider';
import type { AuditResult } from '@shared/types';

export interface ExplainRunResult {
  requestId: string;
  content: string;
  cacheStatus: ExplainCacheStatus;
  latencyMs: number;
  estimatedTokens: number;
  provider: ProviderType;
  model: string;
  promptHash: string;
  response: AIResponse | null;
}

export class ExplainService {
  private activeRequestId: string | null = null;

  buildLayers(
    audit: AuditResult,
    groupId: string,
    actionId: string,
    issueId: string,
  ): ExplainLayersInput {
    const analysis = analysisEngine.analyze(audit);
    const fixPlan = fixPlanner.plan(audit, analysis);
    return { audit, analysis, fixPlan, groupId, actionId, issueId };
  }

  async runExplain(
    layers: ExplainLayersInput,
    onChunk: (chunk: StreamChunk) => void,
    existingRequest?: AIRequest,
  ): Promise<ExplainRunResult> {
    const config = await apiKeyManager.getConfig();
    const context = explainContextBuilder.build(layers);
    const promptHash = await hashExplainPrompt(
      context.frameworkProfile,
      layers.issueId,
      layers.actionId,
    );

    const cached = await explainCache.get(promptHash);
    if (cached) {
      const requestId = existingRequest?.id ?? crypto.randomUUID();
      this.activeRequestId = requestId;
      simulateStream(requestId, cached.content, onChunk);

      await this.recordHistory(layers, context, {
        promptHash,
        cacheStatus: 'hit',
        content: cached.content,
        latencyMs: cached.latencyMs,
        estimatedTokens: cached.estimatedTokens,
        provider: cached.provider,
        model: cached.model,
      });

      this.activeRequestId = null;

      return {
        requestId,
        content: cached.content,
        cacheStatus: 'hit',
        latencyMs: cached.latencyMs,
        estimatedTokens: cached.estimatedTokens,
        provider: cached.provider,
        model: cached.model,
        promptHash,
        response: null,
      };
    }

    const request = existingRequest ?? promptBuilder.buildExplain({ context }, config);
    this.activeRequestId = request.id;
    const started = performance.now();

    const response = await aiService.streamExplain(request, onChunk);
    const latencyMs = response.latencyMs || Math.round(performance.now() - started);
    const content = response.content;
    const estimatedTokens =
      response.usage.totalTokens ||
      estimateRequestTokens(
        buildExplainSystemPrompt(resolveExplainTemplate(context.frameworkProfile)),
        buildExplainUserPrompt(context),
      ) + Math.ceil(content.length / 4);

    if (!response.error && content) {
      await explainCache.set(promptHash, {
        promptHash,
        content,
        provider: response.provider,
        model: response.model,
        latencyMs,
        estimatedTokens,
        cachedAt: Date.now(),
      });
    }

    await this.recordHistory(layers, context, {
      promptHash,
      cacheStatus: 'miss',
      content,
      latencyMs,
      estimatedTokens,
      provider: response.provider,
      model: response.model,
    });

    this.activeRequestId = null;

    return {
      requestId: request.id,
      content,
      cacheStatus: 'miss',
      latencyMs,
      estimatedTokens,
      provider: response.provider,
      model: response.model,
      promptHash,
      response,
    };
  }

  async cancel(): Promise<void> {
    if (!this.activeRequestId) {
      return;
    }
    const config = await apiKeyManager.getConfig();
    aiService.cancel(config.provider);
    this.activeRequestId = null;
  }

  async buildRequestPreview(layers: ExplainLayersInput): Promise<AIRequest> {
    const config = await apiKeyManager.getConfig();
    const context = explainContextBuilder.build(layers);
    return promptBuilder.buildExplain({ context }, config);
  }

  private async recordHistory(
    layers: ExplainLayersInput,
    context: ReturnType<typeof explainContextBuilder.build>,
    meta: {
      promptHash: string;
      cacheStatus: ExplainCacheStatus;
      content: string;
      latencyMs: number;
      estimatedTokens: number;
      provider: ProviderType;
      model: string;
    },
  ): Promise<void> {
    const entry: ExplainHistoryEntry = {
      id: crypto.randomUUID(),
      promptHash: meta.promptHash,
      timestamp: Date.now(),
      provider: meta.provider,
      model: meta.model,
      latencyMs: meta.latencyMs,
      estimatedTokens: meta.estimatedTokens,
      cacheStatus: meta.cacheStatus,
      issueId: layers.issueId,
      actionId: layers.actionId,
      groupId: layers.groupId,
      issueTitle: context.issue.title,
      actionTitle: context.fixAction.title,
      siteUrl: context.siteUrl,
      contentPreview: meta.content.slice(0, 240),
    };

    await explainHistory.append(entry);
  }
}

export const explainService = new ExplainService();
