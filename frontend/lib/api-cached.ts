/**
 * Wrapper do Axios com Cache Integrado
 * 
 * Fornece função wrapper que integra cache automaticamente em requisições GET.
 * Invalida cache automaticamente em operações de mutação (POST, PUT, DELETE).
 */

import type { AxiosRequestConfig, AxiosResponse } from 'axios';
import {
  getCachedData,
  setCachedData,
  invalidateCache,
  clearCache,
  getTTLForEndpoint,
  generateCacheKey,
  calculateDataHash,
  type CacheConfig,
} from './cache';

// Importa a instância do Axios já configurada (com interceptors)
import api from './api';

// ============================================================================
// CONFIGURAÇÃO
// ============================================================================

// Endpoints que NUNCA devem ser cacheados
const NO_CACHE_ENDPOINTS = [
  '/api/v1/auth/login/',
  '/api/v1/auth/logout/',
  '/api/v1/auth/registration/',
  '/api/v1/auth/token/refresh/',
  '/api/v1/password/reset/',
  '/api/v1/password/reset/confirm/',
  '/api/v1/password/change/',
  '/api/v1/resend-verification-email/',
  '/api/v1/verify-email/',
];

// Padrões de endpoints que devem invalidar cache
const INVALIDATION_PATTERNS: Record<string, string[]> = {
  // Mutations de relações usuário-item
  // NOTA: O cache de check (/api/v1/armory/user-sets/check) é atualizado diretamente
  // em addSetRelation/removeSetRelation, então não invalidamos aqui
  '/api/v1/armory/user-sets/add/': [
    // '/api/v1/armory/user-sets/*', // REMOVIDO - causava invalidação do check
    '/api/v1/armory/user-sets/favorites/',
    '/api/v1/armory/user-sets/collection/',
    '/api/v1/armory/user-sets/wishlist/',
  ],
  '/api/v1/armory/user-sets/remove/': [
    // '/api/v1/armory/user-sets/*', // REMOVIDO - causava invalidação do check
    '/api/v1/armory/user-sets/favorites/',
    '/api/v1/armory/user-sets/collection/',
    '/api/v1/armory/user-sets/wishlist/',
  ],
  // Atualizações de perfil
  '/api/v1/profile/update/': [
    '/api/v1/auth/user/',
    '/api/v1/profile/*',
    '/api/v1/dashboard/',
  ],
};

// ============================================================================
// HELPERS
// ============================================================================

/**
 * Verifica se um endpoint deve usar cache
 */
function shouldUseCache(url: string, method: string): boolean {
  if (method.toLowerCase() !== 'get') {
    return false;
  }
  
  return !NO_CACHE_ENDPOINTS.some(endpoint => url.includes(endpoint));
}

/**
 * Normaliza URL para cache (remove query params variáveis como timestamps)
 */
export function normalizeUrl(url: string): string {
  try {
    // Usa a URL base da instância do api importada
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
    const urlObj = new URL(url, API_BASE_URL);
    // Retorna apenas o pathname, sem query params e sem trailing slash
    return urlObj.pathname.replace(/\/$/, '') || '/';
  } catch {
    return url.split('?')[0].replace(/\/$/, '') || '/'; // Fallback simples
  }
}

/**
 * Extrai parâmetros da URL para usar como parte da chave de cache
 */
export function extractParams(url: string): Record<string, unknown> {
  try {
    // Usa a URL base da instância do api importada
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
    const urlObj = new URL(url, API_BASE_URL);
    const params: Record<string, unknown> = {};
    
    urlObj.searchParams.forEach((value, key) => {
      // Remove parâmetros de controle
      if (!['_', 'timestamp', 'nonce', 'cache'].includes(key.toLowerCase())) {
        params[key] = value;
      }
    });
    
    return params;
  } catch {
    const queryString = url.split('?')[1];
    if (!queryString) return {};
    
    const params: Record<string, unknown> = {};
    queryString.split('&').forEach(param => {
      const [key, value] = param.split('=');
      if (key && value) {
        const decodedKey = decodeURIComponent(key);
        const decodedValue = decodeURIComponent(value);
        if (!['_', 'timestamp', 'nonce', 'cache'].includes(decodedKey.toLowerCase())) {
          params[decodedKey] = decodedValue;
        }
      }
    });
    
    return params;
  }
}

/**
 * Invalida cache relacionado a uma mutação
 */
function invalidateRelatedCache(url: string): void {
  // Para operações de user-sets, não invalidamos nada aqui
  // porque addSetRelation/removeSetRelation gerenciam o cache manualmente
  if (url.includes('/user-sets/add/') || url.includes('/user-sets/remove/')) {
    return; // Não faz nada, cache é gerenciado manualmente
  }
  
  // Para outros endpoints, usa os padrões de invalidação
  for (const [pattern, relatedPatterns] of Object.entries(INVALIDATION_PATTERNS)) {
    if (url.includes(pattern)) {
      relatedPatterns.forEach(relatedPattern => {
        invalidateCache(relatedPattern);
      });
    }
  }
}

// ============================================================================
// WRAPPER COM CACHE
// ============================================================================

/**
 * Wrapper para requisições GET com cache automático
 */
export async function cachedGet<T = unknown>(
  url: string,
  config?: AxiosRequestConfig
): Promise<AxiosResponse<T>> {
  const shouldCheckForUpdates = (config as any)?.checkForUpdates === true;
  
  // Verifica cache primeiro
  if (shouldUseCache(url, 'get') && !(config as any)?.skipCache) {
    const normalizedUrl = normalizeUrl(url);
    const params = extractParams(url);
    
    const cachedData = getCachedData<T>(normalizedUrl, params);
    
    if (cachedData !== null) {
      // Se checkForUpdates está ativado, verifica se dados mudaram em background
      if (shouldCheckForUpdates) {
        // Faz requisição em background para verificar se mudou
        // Mas retorna cache imediatamente (stale-while-revalidate)
        api.get<T>(url, config).then(response => {
          const newData = response.data;
          const newHash = calculateDataHash(newData);
          
          // Obtém cache entry para comparar hash
          const cacheKey = generateCacheKey(normalizedUrl, params);
          const cachedStr = localStorage.getItem(cacheKey);
          if (cachedStr) {
            try {
              const entry = JSON.parse(cachedStr);
              // Se hash mudou, atualiza cache
              if (entry.dataHash !== newHash) {
                const ttl = getTTLForEndpoint(normalizedUrl);
                const finalTtl = normalizedUrl.includes('/user-sets/') ? Infinity : ttl;
                setCachedData(normalizedUrl, newData, params, { ttl: finalTtl });
              }
            } catch {
              // Ignora erros de parse
            }
          }
        }).catch(() => {
          // Ignora erros na verificação em background
        });
      }
      
      // Retorna cache imediatamente (mesmo se estiver verificando atualizações)
      return {
        data: cachedData,
        status: 200,
        statusText: 'OK (cached)',
        headers: {},
        config: config || {},
      } as AxiosResponse<T>;
    }
  }
  
  // Só faz requisição real se NÃO encontrou no cache
  const response = await api.get<T>(url, config);
  
  // Cacheia resposta se GET
  // IMPORTANTE: Verifica se já existe cache válido ANTES de salvar
  // para evitar sobrescrever caches atualizados manualmente (ex: relações de user-sets)
  if (shouldUseCache(url, 'get')) {
    const normalizedUrl = normalizeUrl(url);
    const params = extractParams(url);
    
    // Para endpoints de check de relações, SEMPRE verifica se já existe cache
    // Isso evita sobrescrever caches atualizados manualmente em addSetRelation/removeSetRelation
    const isRelationCheck = url.includes('/user-sets/check/');
    
    if (isRelationCheck) {
      // Para checks de relações, verifica cache antes de salvar
      const existingCache = getCachedData<T>(normalizedUrl, params);
      
      // Só salva novo cache se não houver cache válido existente
      // Isso evita sobrescrever caches atualizados manualmente
      if (existingCache === null) {
        const ttl = getTTLForEndpoint(normalizedUrl);
        // IMPORTANTE: Garante que o TTL seja Infinity para user-sets
        const finalTtl = normalizedUrl.includes('/user-sets/') ? Infinity : ttl;
        setCachedData(normalizedUrl, response.data, params, { ttl: finalTtl });
      }
    } else {
      // Para outros endpoints, salva normalmente
      const ttl = getTTLForEndpoint(normalizedUrl);
      // IMPORTANTE: Garante que o TTL seja Infinity para user-sets
      const finalTtl = normalizedUrl.includes('/user-sets/') ? Infinity : ttl;
      setCachedData(normalizedUrl, response.data, params, { ttl: finalTtl });
    }
  }
  
  return response;
}

/**
 * Wrapper para requisições POST com invalidação de cache
 */
export async function cachedPost<T = unknown>(
  url: string,
  data?: unknown,
  config?: AxiosRequestConfig
): Promise<AxiosResponse<T>> {
  const response = await api.post<T>(url, data, config);
  
  // Invalida cache relacionado
  invalidateRelatedCache(url);
  
  return response;
}

/**
 * Wrapper para requisições PUT com invalidação de cache
 */
export async function cachedPut<T = unknown>(
  url: string,
  data?: unknown,
  config?: AxiosRequestConfig
): Promise<AxiosResponse<T>> {
  const response = await api.put<T>(url, data, config);
  
  // Invalida cache relacionado
  invalidateRelatedCache(url);
  
  return response;
}

/**
 * Wrapper para requisições PATCH com invalidação de cache
 */
export async function cachedPatch<T = unknown>(
  url: string,
  data?: unknown,
  config?: AxiosRequestConfig
): Promise<AxiosResponse<T>> {
  const response = await api.patch<T>(url, data, config);
  
  // Invalida cache relacionado
  invalidateRelatedCache(url);
  
  return response;
}

/**
 * Wrapper para requisições DELETE com invalidação de cache
 */
export async function cachedDelete<T = unknown>(
  url: string,
  config?: AxiosRequestConfig
): Promise<AxiosResponse<T>> {
  const response = await api.delete<T>(url, config);
  
  // Invalida cache relacionado
  invalidateRelatedCache(url);
  
  return response;
}

// ============================================================================
// EXPORTS
// ============================================================================

// Exporta a instância do api para uso direto (quando não se quer cache)
// NOTA: A instância vem de api.ts e já tem todos os interceptors configurados
export { api };

// Funções cachedGet, cachedPost, cachedPut, cachedPatch e cachedDelete
// já estão exportadas diretamente nas suas declarações acima
// normalizeUrl e extractParams também estão exportadas nas suas declarações

// Re-export funções de token para compatibilidade
export { setTokens, clearTokens, getAccessToken } from './api';

// Export funções de cache
export { invalidateCache, clearCache, getCacheStats } from './cache';

