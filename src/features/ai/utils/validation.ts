export function maskApiKey(apiKey: string): string {
  if (!apiKey) {
    return '';
  }
  if (apiKey.length <= 8) {
    return '••••••••';
  }
  return `${apiKey.slice(0, 4)}${'•'.repeat(Math.min(12, apiKey.length - 8))}${apiKey.slice(-4)}`;
}

export function isMaskedApiKey(value: string): boolean {
  return value.includes('•');
}

export function isValidTemperature(value: number): boolean {
  return Number.isFinite(value) && value >= 0 && value <= 2;
}

export function isValidMaxTokens(value: number): boolean {
  return Number.isInteger(value) && value >= 256 && value <= 16_384;
}

export function sanitizeBaseUrl(url: string): string {
  return url.trim().replace(/\/+$/, '');
}

export function assertProviderApiKey(
  provider: import('../types').ProviderType,
  apiKey: string,
): void {
  if (provider === 'ollama') {
    return;
  }
  if (!apiKey.trim()) {
    throw new Error('API key is required for this provider.');
  }
}
