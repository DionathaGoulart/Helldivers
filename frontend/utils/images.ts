/**
 * Utilitários para cache de imagens no localStorage
 * 
 * Armazena imagens em base64 no localStorage para evitar requisições repetidas
 */

// ============================================================================
// CONSTANTES
// ============================================================================

export const IMAGE_CACHE_PREFIX = 'helldivers_image_cache_';
const IMAGE_CACHE_VERSION = '1.0';
const MAX_CACHE_SIZE = 3 * 1024 * 1024; // 3MB máximo de cache de imagens (reduzido para evitar estouro)
const MAX_IMAGE_SIZE = 500 * 1024; // 500KB máximo por imagem (para evitar imagens muito grandes)
const CACHE_CLEANUP_THRESHOLD = 0.7; // Limpa quando atinge 70% do limite

// ============================================================================
// TIPOS
// ============================================================================

interface CachedImage {
  url: string;
  dataUrl: string; // base64
  timestamp: number;
  size: number; // tamanho em bytes
}

// ============================================================================
// FUNÇÕES AUXILIARES
// ============================================================================

/**
 * Gera uma chave de cache para uma URL de imagem
 * IMPORTANTE: Esta função deve ser exportada para ser usada em outros arquivos
 */
export function getCacheKey(imageUrl: string): string {
  if (!imageUrl || typeof window === 'undefined') return '';
  
  try {
    // Se já é base64 ou data URL, não precisa cachear
    if (imageUrl.startsWith('data:')) return '';
    
    // Se é URL relativa ou absoluta, normaliza
    if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
      // URL absoluta
      const url = new URL(imageUrl);
      return `${IMAGE_CACHE_PREFIX}${url.pathname}`;
    } else {
      // URL relativa
      return `${IMAGE_CACHE_PREFIX}${imageUrl}`;
    }
  } catch {
    // Se não conseguir parsear, usa a URL como está
    return `${IMAGE_CACHE_PREFIX}${imageUrl}`;
  }
}

/**
 * Calcula o tamanho total do cache de imagens
 */
export function getTotalCacheSize(): number {
  if (typeof window === 'undefined') return 0;
  
  let totalSize = 0;
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith(IMAGE_CACHE_PREFIX)) {
      const value = localStorage.getItem(key);
      if (value) {
        totalSize += value.length; // Aproximação (string length em UTF-16)
      }
    }
  }
  
  return totalSize;
}

/**
 * Remove imagens mais antigas até ficar abaixo do limite
 */
export function cleanOldImages(): void {
  if (typeof window === 'undefined') return;
  
  const images: Array<{ key: string; timestamp: number; size: number }> = [];
  
  // Coleta todas as imagens com timestamp
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith(IMAGE_CACHE_PREFIX)) {
      try {
        const value = localStorage.getItem(key);
        if (value) {
          const cached: CachedImage = JSON.parse(value);
          images.push({
            key,
            timestamp: cached.timestamp,
            size: cached.size,
          });
        }
      } catch {
        // Se não conseguir parsear, remove
        localStorage.removeItem(key);
      }
    }
  }
  
  // Ordena por timestamp (mais antigas primeiro)
  images.sort((a, b) => a.timestamp - b.timestamp);
  
  // Remove até ficar abaixo de 50% do limite (deixa espaço para novas imagens)
  let currentSize = getTotalCacheSize();
  const targetSize = MAX_CACHE_SIZE * 0.5; // Remove até ficar em 50% do limite
  for (const image of images) {
    if (currentSize <= targetSize) break;
    
    localStorage.removeItem(image.key);
    currentSize -= image.size;
  }
}

/**
 * Converte uma URL de imagem para base64
 */
async function imageToBase64(imageUrl: string): Promise<string> {
  try {
    const response = await fetch(imageUrl);
    if (!response.ok) throw new Error('Failed to fetch image');
    
    const blob = await response.blob();
    
    // Verifica tamanho da imagem
    if (blob.size > MAX_IMAGE_SIZE) {
      throw new Error('Image too large');
    }
    
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        resolve(result);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    throw error;
  }
}

// ============================================================================
// FUNÇÕES PÚBLICAS
// ============================================================================

/**
 * Verifica se uma imagem está no cache
 */
export function isImageCached(imageUrl: string): boolean {
  if (typeof window === 'undefined' || !imageUrl) return false;
  
  const cacheKey = getCacheKey(imageUrl);
  const cached = localStorage.getItem(cacheKey);
  
  if (!cached) return false;
  
  try {
    const data: CachedImage = JSON.parse(cached);
    // Verifica se não expirou (cache permanente para imagens)
    return true;
  } catch {
    return false;
  }
}

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

/**
 * Obtém uma imagem do cache ou retorna a URL original normalizada
 */
export function getCachedImageUrl(imageUrl: string): string | null {
  if (typeof window === 'undefined' || !imageUrl) return null;
  
  // Normaliza a URL antes de buscar no cache
  const normalizedUrl = normalizeImageUrl(imageUrl);
  const cacheKey = getCacheKey(normalizedUrl);
  const cached = localStorage.getItem(cacheKey);
  
  if (!cached) return null;
  
  try {
    const data: CachedImage = JSON.parse(cached);
    return data.dataUrl; // Retorna o base64
  } catch {
    return null;
  }
}

/**
 * Cacheia uma imagem no localStorage
 * IMPORTANTE: Verifica o cache ANTES de fazer fetch para evitar requisições desnecessárias
 */
export async function cacheImage(imageUrl: string): Promise<string | null> {
  if (typeof window === 'undefined' || !imageUrl) return null;
  
  // Se já está no cache, retorna base64 SEM fazer fetch
  if (isImageCached(imageUrl)) {
    return getCachedImageUrl(imageUrl);
  }
  
  // IMPORTANTE: Só faz fetch se realmente não está no cache
  
  try {
    // Limpa cache antigo se necessário
    const currentSize = getTotalCacheSize();
    if (currentSize > MAX_CACHE_SIZE) {
      cleanOldImages();
    }
    
    // Converte para base64
    const dataUrl = await imageToBase64(imageUrl);
    
    // Salva no cache
    const cacheKey = getCacheKey(imageUrl);
    const cached: CachedImage = {
      url: imageUrl,
      dataUrl,
      timestamp: Date.now(),
      size: dataUrl.length, // Aproximação do tamanho
    };
    
    localStorage.setItem(cacheKey, JSON.stringify(cached));
    
    return dataUrl;
  } catch (error) {
    // Se falhar, retorna null e usa a URL original
    return null;
  }
}

/**
 * Obtém ou cacheia uma imagem (retorna base64 se cacheada, senão retorna URL original)
 * IMPORTANTE: Se a imagem está no cache, retorna base64 imediatamente SEM fazer fetch
 * 
 * Esta função NUNCA faz fetch se a imagem estiver no cache
 */
export async function getOrCacheImage(imageUrl: string): Promise<string> {
  if (!imageUrl) return '';
  
  // Tenta obter do cache primeiro (síncrono - muito rápido)
  const cached = getCachedImageUrl(imageUrl);
  if (cached) {
    // Se está no cache, retorna base64 imediatamente SEM fazer fetch
    return cached;
  }
  
  // IMPORTANTE: Se não está no cache, retorna a URL original
  // Isso faz o navegador carregar a imagem normalmente
  // E tenta cachear em background para próximas vezes (sem bloquear)
  // Mas não faz fetch aqui - deixa o navegador carregar normalmente
  // Quando o navegador carregar, pode ser cacheado depois
  
  // Não cacheia aqui porque isso faria um fetch desnecessário
  // O cache será feito na primeira vez que a imagem for carregada pelo navegador
  
  return imageUrl;
}

/**
 * Limpa todo o cache de imagens
 */
export function clearImageCache(): void {
  if (typeof window === 'undefined') return;
  
  const keysToRemove: string[] = [];
  
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith(IMAGE_CACHE_PREFIX)) {
      keysToRemove.push(key);
    }
  }
  
  keysToRemove.forEach(key => localStorage.removeItem(key));
}

/**
 * Obtém estatísticas do cache de imagens
 */
export function getImageCacheStats(): {
  count: number;
  size: number;
  maxSize: number;
} {
  if (typeof window === 'undefined') {
    return { count: 0, size: 0, maxSize: MAX_CACHE_SIZE };
  }
  
  let count = 0;
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith(IMAGE_CACHE_PREFIX)) {
      count++;
    }
  }
  
  return {
    count,
    size: getTotalCacheSize(),
    maxSize: MAX_CACHE_SIZE,
  };
}

