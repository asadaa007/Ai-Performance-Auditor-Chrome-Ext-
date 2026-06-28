import type { FrameworkProfile } from '@features/fix-planner';

export async function hashExplainPrompt(
  profile: FrameworkProfile,
  issueId: string,
  actionId: string,
): Promise<string> {
  const payload = JSON.stringify({
    primaryFramework: profile.primaryFramework,
    buildTool: profile.buildTool,
    cms: profile.cms,
    uiLibrary: profile.uiLibrary,
    cssFramework: profile.cssFramework,
    issueId,
    actionId,
  });

  const data = new TextEncoder().encode(payload);
  const digest = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');
}
