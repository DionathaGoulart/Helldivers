/**
 * Utilitários para imagens
 * 
 * Funções auxiliares para normalização de URLs de imagens
 */

// ============================================================================
// FUNÇÕES PÚBLICAS
// ============================================================================

/**
 * Normaliza uma URL de imagem para ser absoluta (adiciona base URL do backend se necessário)
 */
export function normalizeImageUrl(imageUrl: string): string {
  if (!imageUrl) return '';

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
  const FRONTEND_BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || '';

  // Check if it's an absolute URL pointing to the backend and rewrite it
  if (imageUrl.startsWith(API_BASE_URL) || imageUrl.includes('127.0.0.1:8000') || imageUrl.includes('localhost:8000')) {
    // Extract the path part (everything after the domain)
    // We look for /media/ and take everything from there
    const mediaIndex = imageUrl.indexOf('/media/');
    if (mediaIndex !== -1) {
      const relativePath = imageUrl.substring(mediaIndex);
      // If FRONTEND_BASE_URL is present, prepend it, otherwise return relative
      return FRONTEND_BASE_URL ? `${FRONTEND_BASE_URL.replace(/\/$/, '')}${relativePath}` : relativePath;
    }
  }

  // If it's already an absolute URL (and not the backend one we just handled), return as is
  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://') || imageUrl.startsWith('data:')) {
    return imageUrl;
  }

  // If it is a relative URL starting with /media/, prepend frontend base URL if available
  if (imageUrl.startsWith('/media/') || imageUrl.startsWith('media/')) {
    const path = imageUrl.startsWith('/') ? imageUrl : `/${imageUrl}`;
    return FRONTEND_BASE_URL ? `${FRONTEND_BASE_URL.replace(/\/$/, '')}${path}` : path;
  }

  // Se é uma URL relativa, adiciona o base URL do backend
  // Note: API_BASE_URL is defined at the top of the function

  // Remove barra inicial duplicada se existir
  const normalizedPath = imageUrl.startsWith('/') ? imageUrl : `/${imageUrl}`;

  return `${API_BASE_URL}${normalizedPath}`;
}

