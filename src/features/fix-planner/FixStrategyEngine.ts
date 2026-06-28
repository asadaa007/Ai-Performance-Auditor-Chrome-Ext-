import { fixRegistry } from '@features/fix-planner/FixRegistry';
import type { FixActionDraft, FixStrategyContext } from '@features/fix-planner/strategies/shared';
import type { FixAction } from '@features/fix-planner/types';
import type { AnalysisResult } from '@features/analysis';
import type { FrameworkProfile } from '@features/fix-planner/types';
import type { AuditResult } from '@shared/types';

export class FixStrategyEngine {
  generateActions(
    analysis: AnalysisResult,
    audit: AuditResult,
    profile: FrameworkProfile,
  ): FixActionDraft[] {
    const actions: FixActionDraft[] = [];
    const seen = new Set<string>();

    for (const issue of analysis.issues) {
      const strategy = fixRegistry.getStrategy(issue.id);
      if (!strategy) {
        continue;
      }

      const context: FixStrategyContext = { issue, audit, profile };
      const generated = strategy(context);

      for (const draft of generated) {
        if (seen.has(draft.id)) {
          continue;
        }
        seen.add(draft.id);
        actions.push(draft);
      }
    }

    return actions;
  }

  toFixActions(drafts: FixActionDraft[]): FixAction[] {
    return drafts.map((draft) => {
      const { groupId, ...action } = draft;
      void groupId;
      return action;
    });
  }
}

export const fixStrategyEngine = new FixStrategyEngine();
