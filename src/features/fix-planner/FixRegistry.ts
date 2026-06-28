import { accessibilityStrategies } from '@features/fix-planner/strategies/accessibility/AccessibilityStrategies';
import { bestPracticesStrategies } from '@features/fix-planner/strategies/best-practices/BestPracticesStrategies';
import { cssStrategies } from '@features/fix-planner/strategies/css/CssStrategies';
import { domStrategies } from '@features/fix-planner/strategies/dom/DomStrategies';
import { fontStrategies } from '@features/fix-planner/strategies/fonts/FontStrategies';
import { imageStrategies } from '@features/fix-planner/strategies/images/ImageStrategies';
import { javascriptStrategies } from '@features/fix-planner/strategies/javascript/JavaScriptStrategies';
import { networkStrategies } from '@features/fix-planner/strategies/network/NetworkStrategies';
import { performanceStrategies } from '@features/fix-planner/strategies/performance/PerformanceStrategies';
import { seoStrategies } from '@features/fix-planner/strategies/seo/SeoStrategies';
import type { FixStrategy } from '@features/fix-planner/strategies/shared';

export const FIX_STRATEGIES: Record<string, FixStrategy> = {
  ...performanceStrategies,
  ...imageStrategies,
  ...cssStrategies,
  ...javascriptStrategies,
  ...fontStrategies,
  ...domStrategies,
  ...seoStrategies,
  ...accessibilityStrategies,
  ...networkStrategies,
  ...bestPracticesStrategies,
};

export class FixRegistry {
  private readonly strategies: Record<string, FixStrategy>;

  constructor(strategies: Record<string, FixStrategy> = FIX_STRATEGIES) {
    this.strategies = strategies;
  }

  getStrategy(issueId: string): FixStrategy | undefined {
    return this.strategies[issueId];
  }

  getStrategyCount(): number {
    return Object.keys(this.strategies).length;
  }

  listStrategyIds(): string[] {
    return Object.keys(this.strategies);
  }
}

export const fixRegistry = new FixRegistry();
