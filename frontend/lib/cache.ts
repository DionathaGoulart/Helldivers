/**
 * Sistema de Cache com SessionStorage
 * 
 * Implementa cache inteligente para respostas de API com:
 * - TTL (Time To Live) configurável
 * - Versionamento para invalidação
 * - Validação de integridade
 * - Fallback automático
 * - Estatísticas de uso
 */

// ============================================================================
// TIPOS
// ============================================================================

export interface CacheEntry<T = unknown> {
  key: string;
  data: T;
  timestamp: number;
  ttl: number; // em milissegundos
  version: string;
  endpoint: string;
  params?: string;
}

export interface CacheStats {
  hits: number;
  misses: number;
  size: number; // número de entradas
  totalSize: number; // tamanho aproximado em bytes
}

export interface CacheConfig {
  ttl?: number; // TTL padrão em ms
  version?: string; // versão do cache
  skipCache?: boolean; // força bypass do cache
}

// ============================================================================
// CONSTANTES
// ============================================================================

const CACHE_PREFIX = 'api_cache_';
const STATS_KEY = 'api_cache_stats';
const DEFAULT_VERSION = '1.0';
const DEFAULT_TTL = 5 * 60 * 1000; // 5 minutos

// TTLs específicos por tipo de endpoint
export const CACHE_TTLS = {
  // Dados estáticos - validam por toda a sessão
  STATIC: Infinity, // nunca expira na sessão
  // Dados do usuário - cache até logout
  USER_DATA: Infinity,
  // Listagens com filtros - cache médio
  LISTINGS: 10 * 60 * 1000, // 10 minutos
  // Listagens estáticas (passivas, passes) - cache longo
  STATIC_LISTINGS: 30 * 60 * 1000, // 30 minutos
  // Relações usuário-item - cache curto
  USER_RELATIONS: 2 * 60 * 1000, // 2 minutos
  // Dashboard - cache curto
  DASHBOARD: 5 * 60 * 1000, // 5 minutos
  // Validações - cache curto
  VALIDATIONS: 1 * 60 * 1000, // 1 minuto
  // Itens individuais - cache médio
  ITEM_DETAIL: 15 * 60 * 1000, // 15 minutos
} as const;

// ============================================================================
// HELPERS PRIVADOS
// ============================================================================

/**
 * Gera chave de cache a partir de endpoint e parâmetros
 */
function generateCacheKey(endpoint: string, params?: Record<string, unknown>): string {
  const baseKey = endpoint.replace(/^\//, '').replace(/\//g, '_');
  
  if (!params || Object.keys(params).length === 0) {
    return `${CACHE_PREFIX}${baseKey}`;
  }
  
  // Ordena parâmetros para garantir chave consistente
  const sortedParams = Object.keys(params)
    .sort()
    .map(key => `${key}=${JSON.stringify(params[key])}`)
    .join('&');
  
  // Hash simples para evitar chaves muito longas
  const paramsHash = sortedParams.length > 100 
    ? btoa(sortedParams).substring(0, 50)
    : sortedParams.replace(/[^a-zA-Z0-9]/g, '_');
  
  return `${CACHE_PREFIX}${baseKey}_${paramsHash}`;
}

/**
 * Verifica se uma entrada de cache está válida (não expirou)
 */
function isCacheValid<T>(entry: CacheEntry<T>): boolean {
  if (entry.ttl === Infinity) {
    return true; // Cache permanente para a sessão
  }
  
  const now = Date.now();
  const age = now - entry.timestamp;
  return age < entry.ttl;
}

/**
 * Obtém estatísticas do cache
 */
function getCacheStatsInternal(): CacheStats {
  if (typeof window === 'undefined') {
    return { hits: 0, misses: 0, size: 0, totalSize: 0 };
  }
  
  try {
    const statsStr = sessionStorage.getItem(STATS_KEY);
    if (!statsStr) {
      return { hits: 0, misses: 0, size: 0, totalSize: 0 };
    }
    return JSON.parse(statsStr);
  } catch {
    return { hits: 0, misses: 0, size: 0, totalSize: 0 };
  }
}

/**
 * Atualiza estatísticas do cache
 */
function updateStats(isHit: boolean): void {
  if (typeof window === 'undefined') return;
  
  try {
    const stats = getCacheStatsInternal();
    if (isHit) {
      stats.hits++;
    } else {
      stats.misses++;
    }
    sessionStorage.setItem(STATS_KEY, JSON.stringify(stats));
  } catch (error) {
    // Silenciosamente ignora erros de estatísticas
    if (process.env.NODE_ENV === 'development') {
      // Erro ao atualizar estatísticas do cache
    }
  }
}

/**
 * Calcula tamanho aproximado do cache
 */
function calculateCacheSize(): number {
  if (typeof window === 'undefined') return 0;
  
  let totalSize = 0;
  try {
    for (let i = 0; i < sessionStorage.length; i++) {
      const key = sessionStorage.key(i);
      if (key && key.startsWith(CACHE_PREFIX)) {
        const value = sessionStorage.getItem(key);
        if (value) {
          totalSize += key.length + value.length;
        }
      }
    }
  } catch {
    // Ignora erros
  }
  
  return totalSize;
}

/**
 * Limpa entradas expiradas do cache
 */
function cleanExpiredEntries(): void {
  if (typeof window === 'undefined') return;
  
  try {
    const keysToRemove: string[] = [];
    
    for (let i = 0; i < sessionStorage.length; i++) {
      const key = sessionStorage.key(i);
      if (key && key.startsWith(CACHE_PREFIX)) {
        try {
          const value = sessionStorage.getItem(key);
          if (value) {
            const entry: CacheEntry = JSON.parse(value);
            if (!isCacheValid(entry)) {
              keysToRemove.push(key);
            }
          }
        } catch {
          // Se não conseguir parsear, remove também
          keysToRemove.push(key);
        }
      }
    }
    
    keysToRemove.forEach(key => sessionStorage.removeItem(key));
  } catch (error) {
    // Erro ao limpar cache expirado
  }
}

// ============================================================================
// FUNÇÕES PÚBLICAS
// ============================================================================

/**
 * Obtém dados do cache
 * @param endpoint - Endpoint da API
 * @param params - Parâmetros da requisição (opcional)
 * @param config - Configurações adicionais
 * @returns Dados cacheados ou null se não encontrado/expirado
 */
export function getCachedData<T = unknown>(
  endpoint: string,
  params?: Record<string, unknown>,
  config: CacheConfig = {}
): T | null {
  if (typeof window === 'undefined') {
    return null;
  }
  
  if (config.skipCache) {
    updateStats(false);
    return null;
  }
  
  try {
    cleanExpiredEntries();
    
    const cacheKey = generateCacheKey(endpoint, params);
    const cachedStr = sessionStorage.getItem(cacheKey);
    
    if (!cachedStr) {
      updateStats(false);
      return null;
    }
    
    const entry: CacheEntry<T> = JSON.parse(cachedStr);
    
    // Verifica versão
    const expectedVersion = config.version || DEFAULT_VERSION;
    if (entry.version !== expectedVersion) {
      sessionStorage.removeItem(cacheKey);
      updateStats(false);
      return null;
    }
    
    // Verifica se está válido
    if (!isCacheValid(entry)) {
      sessionStorage.removeItem(cacheKey);
      updateStats(false);
      return null;
    }
    
    // Cache hit!
    updateStats(true);
    
    return entry.data;
  } catch (error) {
    // Em caso de erro, trata como miss e limpa entrada corrompida
    updateStats(false);
    return null;
  }
}

/**
 * Salva dados no cache
 * @param endpoint - Endpoint da API
 * @param data - Dados a serem cacheados
 * @param params - Parâmetros da requisição (opcional)
 * @param config - Configurações (TTL, version, etc.)
 */
export function setCachedData<T = unknown>(
  endpoint: string,
  data: T,
  params?: Record<string, unknown>,
  config: CacheConfig = {}
): void {
  if (typeof window === 'undefined') {
    return;
  }
  
  try {
    const cacheKey = generateCacheKey(endpoint, params);
    const ttl = config.ttl ?? DEFAULT_TTL;
    const version = config.version || DEFAULT_VERSION;
    
    const entry: CacheEntry<T> = {
      key: cacheKey,
      data,
      timestamp: Date.now(),
      ttl,
      version,
      endpoint,
      params: params ? JSON.stringify(params) : undefined,
    };
    
    sessionStorage.setItem(cacheKey, JSON.stringify(entry));
    
    // Atualiza estatísticas
    const stats = getCacheStatsInternal();
    stats.size = Object.keys(sessionStorage)
      .filter(key => key.startsWith(CACHE_PREFIX)).length;
    stats.totalSize = calculateCacheSize();
    sessionStorage.setItem(STATS_KEY, JSON.stringify(stats));
  } catch (error) {
    // Se exceder limite de armazenamento, limpa cache expirado e tenta novamente
    if (error instanceof DOMException && error.code === 22) {
      cleanExpiredEntries();
      
      try {
        const cacheKey = generateCacheKey(endpoint, params);
        const ttl = config.ttl ?? DEFAULT_TTL;
        const version = config.version || DEFAULT_VERSION;
        
        const entry: CacheEntry<T> = {
          key: cacheKey,
          data,
          timestamp: Date.now(),
          ttl,
          version,
          endpoint,
          params: params ? JSON.stringify(params) : undefined,
        };
        
        sessionStorage.setItem(cacheKey, JSON.stringify(entry));
      } catch (retryError) {
        // Erro ao salvar após limpeza
      }
    }
  }
}

/**
 * Invalida cache por padrão
 * @param pattern - Padrão para invalidar (endpoint, regex, ou '*' para tudo)
 */
export function invalidateCache(pattern: string = '*'): void {
  if (typeof window === 'undefined') return;
  
  try {
    const keysToRemove: string[] = [];
    
    if (pattern === '*') {
      // Remove todo o cache
      for (let i = 0; i < sessionStorage.length; i++) {
        const key = sessionStorage.key(i);
        if (key && key.startsWith(CACHE_PREFIX)) {
          keysToRemove.push(key);
        }
      }
    } else if (pattern.startsWith('/')) {
      // Padrão de endpoint
      const normalizedPattern = pattern.replace(/^\//, '').replace(/\//g, '_');
      const regex = new RegExp(`^${CACHE_PREFIX}${normalizedPattern}`, 'i');
      
      for (let i = 0; i < sessionStorage.length; i++) {
        const key = sessionStorage.key(i);
        if (key && regex.test(key)) {
          keysToRemove.push(key);
        }
      }
    } else {
      // Regex customizado
      const regex = new RegExp(pattern, 'i');
      
      for (let i = 0; i < sessionStorage.length; i++) {
        const key = sessionStorage.key(i);
        if (key && regex.test(key)) {
          keysToRemove.push(key);
        }
      }
    }
    
    keysToRemove.forEach(key => sessionStorage.removeItem(key));
    
    // Atualiza estatísticas
    const stats = getCacheStatsInternal();
    stats.size = Object.keys(sessionStorage)
      .filter(key => key.startsWith(CACHE_PREFIX)).length;
    stats.totalSize = calculateCacheSize();
    sessionStorage.setItem(STATS_KEY, JSON.stringify(stats));
  } catch (error) {
    // Erro ao invalidar cache
  }
}

/**
 * Obtém estatísticas de uso do cache
 */
export function getCacheStats(): CacheStats {
  const stats = getCacheStatsInternal();
  stats.size = typeof window !== 'undefined' 
    ? Object.keys(sessionStorage).filter(key => key.startsWith(CACHE_PREFIX)).length
    : 0;
  stats.totalSize = calculateCacheSize();
  return stats;
}

/**
 * Limpa todo o cache
 */
export function clearCache(): void {
  invalidateCache('*');
  
  // Reseta estatísticas
  if (typeof window !== 'undefined') {
    sessionStorage.removeItem(STATS_KEY);
  }
}

/**
 * Determina TTL apropriado para um endpoint
 */
export function getTTLForEndpoint(endpoint: string): number {
  // Dados do usuário
  if (endpoint.includes('/auth/user') || endpoint.includes('/profile/')) {
    return CACHE_TTLS.USER_DATA;
  }
  
  // Listagens estáticas
  if (endpoint.includes('/passives/') || endpoint.includes('/passes/')) {
    return CACHE_TTLS.STATIC_LISTINGS;
  }
  
  // Relações usuário-item
  if (endpoint.includes('/user-sets/')) {
    return CACHE_TTLS.USER_RELATIONS;
  }
  
  // Dashboard
  if (endpoint.includes('/dashboard/')) {
    return CACHE_TTLS.DASHBOARD;
  }
  
  // Validações
  if (endpoint.includes('/check/')) {
    return CACHE_TTLS.VALIDATIONS;
  }
  
  // Itens individuais
  if (/\/(armors|sets|helmets|capes|passes)\/\d+\//.test(endpoint)) {
    return CACHE_TTLS.ITEM_DETAIL;
  }
  
  // Listagens com filtros
  if (endpoint.includes('/armors/') || 
      endpoint.includes('/sets/') || 
      endpoint.includes('/helmets/') || 
      endpoint.includes('/capes/')) {
    return CACHE_TTLS.LISTINGS;
  }
  
  // Padrão
  return DEFAULT_TTL;
}

