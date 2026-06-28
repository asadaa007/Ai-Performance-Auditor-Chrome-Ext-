export async function safeCollect<T>(
  collectorName: string,
  fn: () => T | Promise<T>,
): Promise<T | Error> {
  try {
    return await fn();
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return new CollectorError(collectorName, message);
  }
}

export class CollectorError extends Error {
  readonly collector: string;

  constructor(collector: string, message: string) {
    super(message);
    this.collector = collector;
    this.name = 'CollectorError';
  }
}

export function isCollectorError<T>(value: T | Error): value is CollectorError {
  return value instanceof CollectorError;
}

export function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}
