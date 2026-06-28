import { contextBuilder } from '@features/ai/prompt/ContextBuilder';
import { getSystemPrompt } from '@features/ai/prompt/SystemPrompt';
import { buildUserPrompt } from '@features/ai/prompt/UserPrompt';
import { buildExplainUserPrompt } from '@features/ai-explain/prompt/buildExplainUserPrompt';
import {
  buildExplainSystemPrompt,
  resolveExplainTemplate,
} from '@features/ai-explain/prompt/explainSystemPrompt';
import { AI_LIMITS, type AIConfig } from '@features/ai/types/config';
import type { AIRequest, ExplainPromptInput, PromptBuilderInput } from '@features/ai/types/request';
import { estimateRequestTokens, truncateToTokenBudget } from '@features/ai/utils/tokenEstimator';

export class PromptBuilder {
  buildExplain(input: ExplainPromptInput, config: AIConfig): AIRequest {
    const template = resolveExplainTemplate(input.context.frameworkProfile);
    const systemPrompt = buildExplainSystemPrompt(template);
    const userPrompt = truncateToTokenBudget(
      buildExplainUserPrompt(input.context),
      Math.floor(AI_LIMITS.maxPromptChars / 4),
    );

    return {
      id: crypto.randomUUID(),
      provider: config.provider,
      model: config.model,
      systemPrompt,
      userPrompt,
      temperature: config.temperature,
      maxTokens: config.maxTokens,
      template,
      estimatedInputTokens: estimateRequestTokens(systemPrompt, userPrompt),
    };
  }

  build(input: PromptBuilderInput, config: AIConfig): AIRequest {
    const template = input.template ?? 'general-analysis';
    const context = contextBuilder.build(
      input.audit,
      input.analysis,
      input.selectedIssueId,
      input.maxIssues ?? AI_LIMITS.maxIssuesInContext,
    );

    const systemPrompt = getSystemPrompt(template);
    const userPrompt = truncateToTokenBudget(
      buildUserPrompt(context),
      Math.floor(AI_LIMITS.maxPromptChars / 4),
    );

    return {
      id: crypto.randomUUID(),
      provider: config.provider,
      model: config.model,
      systemPrompt,
      userPrompt,
      temperature: config.temperature,
      maxTokens: config.maxTokens,
      template,
      estimatedInputTokens: estimateRequestTokens(systemPrompt, userPrompt),
    };
  }
}

export const promptBuilder = new PromptBuilder();
