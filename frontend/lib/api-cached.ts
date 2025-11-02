/**
 * Wrapper do Axios com Cache Integrado
 * 
 * Fornece função wrapper que integra cache automaticamente em requisições GET.
 * Invalida cache automaticamente em operações de mutação (POST, PUT, DELETE).
 */

import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import {
  getCachedData,
  setCachedData,
  invalidateCache,
  getTTLForEndpoint,
  type CacheConfig,
} from './cache';

// ============================================================================
// CONFIGURAÇÃO
// ============================================================================

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

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
  '/api/v1/armory/user-sets/add/': [
    '/api/v1/armory/user-sets/*',
    '/api/v1/armory/user-sets/favorites/',
    '/api/v1/armory/user-sets/collection/',
    '/api/v1/armory/user-sets/wishlist/',
  ],
  '/api/v1/armory/user-sets/remove/': [
    '/api/v1/armory/user-sets/*',
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
function normalizeUrl(url: string): string {
  try {
    const urlObj = new URL(url, API_BASE_URL);
    const baseUrl = urlObj.pathname;
    const params = Array.from(urlObj.searchParams.entries())
      .filter(([key]) => !['_', 'timestamp', 'nonce', 'cache'].includes(key.toLowerCase()))
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, value]) => `${key}=${value}`)
      .join('&');
    
    return params ? `${baseUrl}?${params}` : baseUrl;
  } catch {
    return url.split('?')[0]; // Fallback simples
  }
}

/**
 * Extrai parâmetros da URL para usar como parte da chave de cache
 */
function extractParams(url: string): Record<string, unknown> {
  try {
    const urlObj = new URL(url, API_BASE_URL);
    const params: Record<string, unknown> = {};
    
    urlObj.searchParams.forEach((value, key) => {
      // Remove parâmetros de controle
      if (!['_', 'timestamp', 'nonce', 'cache'].includes(key.toLowerCase())) {
        try {
          params[key] = JSON.parse(value);
        } catch {
          params[key] = value;
        }
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
  for (const [pattern, relatedPatterns] of Object.entries(INVALIDATION_PATTERNS)) {
    if (url.includes(pattern)) {
      relatedPatterns.forEach(relatedPattern => {
        invalidateCache(relatedPattern);
      });
    }
  }
  
  // Invalidação específica baseada no endpoint
  if (url.includes('/user-sets/add/') || url.includes('/user-sets/remove/')) {
    invalidateCache('/api/v1/armory/user-sets/check/');
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
  // Verifica cache primeiro
  if (shouldUseCache(url, 'get') && !(config as any)?.skipCache) {
    const normalizedUrl = normalizeUrl(url);
    const params = extractParams(url);
    
    const cachedData = getCachedData<T>(normalizedUrl, params);
    
    if (cachedData !== null) {
      // Retorna resposta mockada com dados do cache
      return {
        data: cachedData,
        status: 200,
        statusText: 'OK (cached)',
        headers: {},
        config: config || {},
      } as AxiosResponse<T>;
    }
  }
  
  // Faz requisição real
  const response = await api.get<T>(url, config);
  
  // Cacheia resposta se GET
  if (shouldUseCache(url, 'get')) {
    const normalizedUrl = normalizeUrl(url);
    const params = extractParams(url);
    const ttl = getTTLForEndpoint(normalizedUrl);
    
    setCachedData(normalizedUrl, response.data, params, { ttl });
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
// INSTÂNCIA AXIOS BASE
// ============================================================================

// Cria instância do axios base (sem cache nos interceptors, usaremos os wrappers)
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Enviar cookies automaticamente
});

// Interceptor para requisições
// Tokens agora são gerenciados via cookies HttpOnly pelo servidor
api.interceptors.request.use(
  (config) => {
    // Cookies são enviados automaticamente com withCredentials: true
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para lidar com erros de autenticação
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Tenta renovar o token usando cookies
        // O refresh token está no cookie, o backend gerencia automaticamente
        await axios.post(
          `${API_BASE_URL}/api/v1/auth/token/refresh/`,
          {}, // Body vazio, token vem do cookie
          {
            withCredentials: true,
          }
        );

        // Retenta a requisição original
        // O novo access token já está no cookie
        return api(originalRequest);
      } catch (refreshError) {
        // Se falhou, limpa cache e redireciona para a página inicial
        // Os cookies serão limpos automaticamente pelo logout
        if (typeof window !== 'undefined') {
          // Invalida cache de autenticação antes de redirecionar
          invalidateCache('/api/v1/auth/user/');
          clearCache();
          window.location.href = '/';
        }
      }
    }

    return Promise.reject(error);
  }
);

// ============================================================================
// EXPORTS
// ============================================================================

// Export instância base para casos especiais
export { api };

// Funções cachedGet, cachedPost, cachedPut, cachedPatch e cachedDelete
// já estão exportadas diretamente nas suas declarações acima

// Re-export funções de token para compatibilidade
export { setTokens, clearTokens, getAccessToken } from './api';

// Export funções de cache
export { invalidateCache, clearCache, getCacheStats } from './cache';

