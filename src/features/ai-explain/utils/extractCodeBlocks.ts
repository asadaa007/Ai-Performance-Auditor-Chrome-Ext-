export function extractCodeBlocks(markdown: string): string[] {
  const blocks: string[] = [];
  const fencePattern = /```[\w-]*\n([\s\S]*?)```/g;
  let match: RegExpExecArray | null = fencePattern.exec(markdown);

  while (match) {
    const code = match[1]?.trim();
    if (code) {
      blocks.push(code);
    }
    match = fencePattern.exec(markdown);
  }

  return blocks;
}

export function extractPrimaryCodeBlock(markdown: string): string | null {
  const blocks = extractCodeBlocks(markdown);
  return blocks[0] ?? null;
}
