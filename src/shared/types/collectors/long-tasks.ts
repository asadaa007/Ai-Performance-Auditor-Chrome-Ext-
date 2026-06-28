export interface LongTaskEntry {
  duration: number;
  startTime: number;
  name: string | null;
}

export interface LongTasksResult {
  supported: boolean;
  longTaskCount: number;
  totalBlockingTime: number;
  longestTaskMs: number;
  tasks: LongTaskEntry[];
}
