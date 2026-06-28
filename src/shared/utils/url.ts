export function normalizePageUrl(url: string, includeHash: boolean): string {
  try {
    const parsed = new URL(url);
    const base = `${parsed.origin}${parsed.pathname}${parsed.search}`;
    return includeHash ? `${base}${parsed.hash}` : base;
  } catch {
    return url;
  }
}

export function hasPageUrlChanged(
  previousUrl: string,
  nextUrl: string,
  trackHashChanges: boolean,
): boolean {
  return (
    normalizePageUrl(previousUrl, trackHashChanges) !== normalizePageUrl(nextUrl, trackHashChanges)
  );
}
