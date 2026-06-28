export function getCommandKeyLabel(): string {
  const isMac =
    typeof navigator !== 'undefined' && /Mac|iPhone|iPad|iPod/.test(navigator.platform);
  return isMac ? '⌘K' : 'Ctrl+K';
}
