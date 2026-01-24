/**
 * Componente CachedImage
 * 
 * Componente de imagem simples (sem cache)
 */

'use client';

// ============================================================================
// IMPORTS
// ============================================================================

import { useState, useEffect } from 'react';
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
  onError,
  ...props
}: CachedImageProps) {
  // Estado para controlar a fonte da imagem
  const [imageSrc, setImageSrc] = useState<string>(
    src ? normalizeImageUrl(src) : (fallback || '')
  );

  // Atualiza a imagem se a prop src mudar
  useEffect(() => {
    setImageSrc(src ? normalizeImageUrl(src) : (fallback || ''));
  }, [src, fallback]);

  const handleError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    // Se ocorrer erro e tivermos um fallback, usa o fallback
    if (fallback && imageSrc !== fallback) {
      setImageSrc(fallback);
    }

    // Propaga o evento de erro se fornecido
    if (onError) {
      onError(e);
    }
  };

  return (
    <img
      src={imageSrc}
      alt={alt}
      onError={handleError}
      loading="lazy"
      crossOrigin="anonymous"
      {...props}
    />
  );
}



