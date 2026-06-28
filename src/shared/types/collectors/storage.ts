export interface StorageResult {
  localStorage: {
    keyCount: number;
    estimatedSizeBytes: number;
    keys: string[];
  };
  sessionStorage: {
    keyCount: number;
    estimatedSizeBytes: number;
    keys: string[];
  };
  cookies: {
    count: number;
    estimatedSizeBytes: number;
    names: string[];
  };
  indexedDB: {
    available: boolean;
    databaseNames: string[];
  };
}
