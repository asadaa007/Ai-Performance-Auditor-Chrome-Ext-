export function stripMarkdownFences(content: string): string {
  return content
    .replace(/^```[\w]*\n?/gm, '')
    .replace(/```$/gm, '')
    .trim();
}

export function normalizeWhitespace(content: string): string {
  return content.replace(/\n{3,}/g, '\n\n').trim();
}
