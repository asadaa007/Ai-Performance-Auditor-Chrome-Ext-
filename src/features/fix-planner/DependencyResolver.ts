import type { FixAction } from '@features/fix-planner/types';

export interface DependencyResolution {
  actions: FixAction[];
  unresolvedDependencies: string[];
}

export class DependencyResolver {
  resolve(actions: FixAction[]): DependencyResolution {
    const byId = new Map(actions.map((action) => [action.id, action]));
    const unresolvedDependencies: string[] = [];

    for (const action of actions) {
      for (const dependencyId of action.dependsOn) {
        if (!byId.has(dependencyId)) {
          unresolvedDependencies.push(`${action.id} -> ${dependencyId}`);
        }
      }
    }

    const sorted = this.topologicalSort(actions, byId);
    return {
      actions: sorted,
      unresolvedDependencies: [...new Set(unresolvedDependencies)],
    };
  }

  sortWithinGroup(actions: FixAction[]): FixAction[] {
    const byId = new Map(actions.map((action) => [action.id, action]));
    return this.topologicalSort(actions, byId);
  }

  private topologicalSort(actions: FixAction[], byId: Map<string, FixAction>): FixAction[] {
    const visited = new Set<string>();
    const visiting = new Set<string>();
    const sorted: FixAction[] = [];

    const visit = (action: FixAction): void => {
      if (visited.has(action.id)) {
        return;
      }
      if (visiting.has(action.id)) {
        return;
      }

      visiting.add(action.id);

      for (const dependencyId of action.dependsOn) {
        const dependency = byId.get(dependencyId);
        if (dependency) {
          visit(dependency);
        }
      }

      visiting.delete(action.id);
      visited.add(action.id);
      sorted.push(action);
    };

    for (const action of actions) {
      visit(action);
    }

    return sorted;
  }
}

export const dependencyResolver = new DependencyResolver();
