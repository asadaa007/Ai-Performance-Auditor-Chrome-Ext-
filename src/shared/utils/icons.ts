export const EXTENSION_ICON_SIZES = [16, 32, 48, 128] as const;

export type ExtensionIconSize = (typeof EXTENSION_ICON_SIZES)[number];

const ICON_BASE_PATH = 'public/icons';

export function getExtensionIconPath(size: ExtensionIconSize): string {
  return `${ICON_BASE_PATH}/icon-${size}.png`;
}

export function getExtensionIconUrl(size: ExtensionIconSize = 128): string {
  const path = getExtensionIconPath(size);

  if (typeof chrome !== 'undefined' && chrome.runtime?.getURL) {
    return chrome.runtime.getURL(path);
  }

  return `/${path}`;
}

export function pickExtensionIconSize(displaySize: number): ExtensionIconSize {
  if (displaySize <= 20) return 16;
  if (displaySize <= 40) return 32;
  if (displaySize <= 64) return 48;
  return 128;
}
