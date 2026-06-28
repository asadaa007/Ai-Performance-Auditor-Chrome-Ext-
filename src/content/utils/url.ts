export function normalizeUrl(url: string): string {
  try {
    const parsed = new URL(url, window.location.href);
    parsed.hash = '';
    return parsed.href;
  } catch {
    return url;
  }
}

export function getHostname(url: string): string | null {
  try {
    return new URL(url, window.location.href).hostname;
  } catch {
    return null;
  }
}

export function isThirdPartyUrl(url: string, pageOrigin: string): boolean {
  const hostname = getHostname(url);
  if (!hostname) {
    return false;
  }

  try {
    const pageHost = new URL(pageOrigin).hostname;
    return hostname !== pageHost && !hostname.endsWith(`.${pageHost}`);
  } catch {
    return false;
  }
}

export function getImageFormat(src: string): string | null {
  const cleaned = src.split('?')[0]?.split('#')[0] ?? '';
  const match = cleaned.match(/\.([a-zA-Z0-9]+)$/);
  return match?.[1]?.toLowerCase() ?? null;
}

export function isModernImageFormat(format: string | null): boolean {
  return format === 'webp' || format === 'avif';
}

export function estimateStorageSize(value: string): number {
  return new Blob([value]).size;
}

export function elementSelector(element: Element): string {
  const tag = element.tagName.toLowerCase();
  const id = element.id ? `#${element.id}` : '';
  const classes =
    element.classList.length > 0 ? `.${Array.from(element.classList).slice(0, 3).join('.')}` : '';
  return `${tag}${id}${classes}`;
}
