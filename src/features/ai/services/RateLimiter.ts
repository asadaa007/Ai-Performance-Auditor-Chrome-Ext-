import { AI_LIMITS } from '@features/ai/types/config';

export class RateLimiter {
  private readonly timestamps: number[] = [];

  constructor(private readonly maxRequestsPerMinute = AI_LIMITS.rateLimitPerMinute) {}

  async acquire(): Promise<void> {
    const now = Date.now();
    const windowStart = now - 60_000;
    this.timestamps.splice(
      0,
      this.timestamps.length,
      ...this.timestamps.filter((timestamp) => timestamp > windowStart),
    );

    if (this.timestamps.length >= this.maxRequestsPerMinute) {
      const waitMs = this.timestamps[0] + 60_000 - now;
      await new Promise((resolve) => setTimeout(resolve, Math.max(waitMs, 0)));
    }

    this.timestamps.push(Date.now());
  }
}

export const rateLimiter = new RateLimiter();
