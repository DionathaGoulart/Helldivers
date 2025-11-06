/**
 * Componente CachedImage
 * 
 * Componente de imagem simples (sem cache)
 */

'use client';

// ============================================================================
// IMPORTS
// ============================================================================

import { normalizeImageUrl } from '@/utils/images';

// ============================================================================
// TIPOS
// ============================================================================

interface CachedImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src?: string;
  fallback?: string;
}

// ============================================================================
// COMPONENTE
// ============================================================================

/**
 * Componente de imagem simples
 */
export default function CachedImage({
  src,
  fallback,
  alt,
  ...props
}: CachedImageProps) {
  // Normaliza a URL da imagem
  const imageSrc = src ? normalizeImageUrl(src) : (fallback || '');

  return (
    <img
      src={imageSrc}
      alt={alt}
      loading="lazy"
      crossOrigin="anonymous"
      {...props}
    />
  );
}



