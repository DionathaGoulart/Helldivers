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
  
  // Se já é uma URL absoluta (http/https) ou data URL, retorna como está
  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://') || imageUrl.startsWith('data:')) {
    return imageUrl;
  }
  
  // Se é uma URL relativa, adiciona o base URL do backend
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
  
  // Remove barra inicial duplicada se existir
  const normalizedPath = imageUrl.startsWith('/') ? imageUrl : `/${imageUrl}`;
  
  return `${API_BASE_URL}${normalizedPath}`;
}

