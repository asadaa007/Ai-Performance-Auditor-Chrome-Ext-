export function estimateTokens(text: string): number {
  if (!text) {
    return 0;
  }
  return Math.ceil(text.length / 4);
}

export function estimateRequestTokens(systemPrompt: string, userPrompt: string): number {
  return estimateTokens(systemPrompt) + estimateTokens(userPrompt);
}

export function truncateToTokenBudget(text: string, maxTokens: number): string {
  const maxChars = maxTokens * 4;
  if (text.length <= maxChars) {
    return text;
  }
  return `${text.slice(0, maxChars - 20)}\n\n[context truncated]`;
}
