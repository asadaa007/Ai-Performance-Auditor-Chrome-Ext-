import type { Collector } from '@content/collectors/types';
import { createEmptyLongTasksResult } from '@content/collectors/defaults';
import type { LongTasksResult } from '@shared/types';

const LONG_TASK_THRESHOLD_MS = 50;
const OBSERVATION_MS = 5000;

export class LongTasksCollector implements Collector<LongTasksResult> {
  readonly name = 'longTasks';

  async collect(): Promise<LongTasksResult> {
    const empty = createEmptyLongTasksResult();

    if (typeof PerformanceObserver === 'undefined') {
      return empty;
    }

    const tasks: LongTasksResult['tasks'] = [];

    try {
      await new Promise<void>((resolve) => {
        let settled = false;
        const finish = () => {
          if (settled) return;
          settled = true;
          observer.disconnect();
          clearTimeout(timer);
          resolve();
        };

        const observer = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            tasks.push({
              duration: Math.round(entry.duration),
              startTime: Math.round(entry.startTime),
              name: entry.name ?? null,
            });
          }
        });

        observer.observe({ type: 'longtask', buffered: true });
        const timer = window.setTimeout(finish, OBSERVATION_MS);
      });
    } catch {
      return empty;
    }

    const longTasks = tasks.filter(
      (task: LongTasksResult['tasks'][number]) => task.duration >= LONG_TASK_THRESHOLD_MS,
    );
    const totalBlockingTime = longTasks.reduce(
      (sum: number, task: LongTasksResult['tasks'][number]) => sum + task.duration,
      0,
    );
    const longestTaskMs = longTasks.reduce(
      (max: number, task: LongTasksResult['tasks'][number]) => Math.max(max, task.duration),
      0,
    );

    return {
      supported: true,
      longTaskCount: longTasks.length,
      totalBlockingTime,
      longestTaskMs,
      tasks: longTasks.slice(0, 50),
    };
  }
}
