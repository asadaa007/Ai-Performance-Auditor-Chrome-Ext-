import { getExtensionIconUrl, pickExtensionIconSize } from '@shared/utils/icons';

interface ExtensionLogoProps {
  size?: number;
  className?: string;
  alt?: string;
}

export function ExtensionLogo({
  size = 48,
  className = '',
  alt = 'AI Performance Auditor',
}: ExtensionLogoProps) {
  const assetSize = pickExtensionIconSize(size);

  return (
    <img
      src={getExtensionIconUrl(assetSize)}
      alt={alt}
      width={size}
      height={size}
      className={`shrink-0 rounded-2xl object-cover shadow-card ${className}`}
      decoding="async"
    />
  );
}
