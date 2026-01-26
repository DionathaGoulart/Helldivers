/**
 * Sistema de Cache com LocalStorage
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
  dataHash?: string; // Hash dos dados para verificação de mudanças
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
  checkForUpdates?: boolean; // verifica se dados mudaram mesmo com cache válido
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
  // Listagens estáticas (passivas, passes, armors, sets, helmets, capes) - cache pela sessão
  STATIC_LISTINGS: Infinity, // nunca expira na sessão
  // Relações usuário-item - cache pela sessão (invalidado manualmente)
  USER_RELATIONS: Infinity, // nunca expira na sessão
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
export function generateCacheKey(endpoint: string, params?: Record<string, unknown>): string {
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
 * Calcula hash simples dos dados para verificação de mudanças
 */
export function calculateDataHash<T>(data: T): string {
  try {
    const jsonStr = JSON.stringify(data);
    // Hash simples usando algoritmo de string
    let hash = 0;
    for (let i = 0; i < jsonStr.length; i++) {
      const char = jsonStr.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return hash.toString(36);
  } catch {
    return '';
  }
}

/**
 * Verifica se uma entrada de cache está válida (não expirou)
 */
function isCacheValid<T>(entry: CacheEntry<T>): boolean {
  // Se TTL é Infinity ou null (legado), nunca expira
  if (entry.ttl === Infinity || entry.ttl === null) {
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
    const statsStr = localStorage.getItem(STATS_KEY);
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
    localStorage.setItem(STATS_KEY, JSON.stringify(stats));
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
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(CACHE_PREFIX)) {
        const value = localStorage.getItem(key);
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

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(CACHE_PREFIX)) {
        try {
          const value = localStorage.getItem(key);
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

    keysToRemove.forEach(key => localStorage.removeItem(key));
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
    // Primeiro verifica o cache específico ANTES de limpar entradas expiradas
    // Isso evita que o cache recém-salvo seja removido por race conditions
    const cacheKey = generateCacheKey(endpoint, params);
    const cachedStr = localStorage.getItem(cacheKey);

    if (cachedStr) {
      try {
        const entry: CacheEntry<T> = JSON.parse(cachedStr);

        // Verifica versão
        const expectedVersion = config.version || DEFAULT_VERSION;
        if (entry.version === expectedVersion) {
          // Verifica se está válido
          if (isCacheValid(entry)) {
            // Cache hit! Retorna imediatamente sem limpar outras entradas
            updateStats(true);
            return entry.data;
          }
        }
      } catch {
        // Se não conseguir parsear, trata como miss
      }
    }

    // Se não encontrou cache válido, limpa entradas expiradas (apenas uma vez)
    // e retorna null
    cleanExpiredEntries();
    updateStats(false);
    return null;
  } catch (error) {
    // Em caso de erro, trata como miss
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
    // IMPORTANTE: Garante que user-sets sempre tenha TTL Infinity
    let ttl = config.ttl ?? DEFAULT_TTL;
    if (endpoint.includes('/user-sets') && ttl !== Infinity) {
      ttl = Infinity;
    }
    const version = config.version || DEFAULT_VERSION;

    // Calcula hash dos dados para verificação de mudanças
    const dataHash = calculateDataHash(data);

    const entry: CacheEntry<T> = {
      key: cacheKey,
      data,
      timestamp: Date.now(),
      ttl,
      version,
      endpoint,
      params: params ? JSON.stringify(params) : undefined,
      dataHash,
    };

    localStorage.setItem(cacheKey, JSON.stringify(entry));

    // Atualiza estatísticas
    const stats = getCacheStatsInternal();
    stats.size = Object.keys(localStorage)
      .filter(key => key.startsWith(CACHE_PREFIX)).length;
    stats.totalSize = calculateCacheSize();
    localStorage.setItem(STATS_KEY, JSON.stringify(stats));
  } catch (error) {
    // Se exceder limite de armazenamento, limpa cache expirado e tenta novamente
    if (error instanceof DOMException && error.code === 22) {
      cleanExpiredEntries();

      try {
        const cacheKey = generateCacheKey(endpoint, params);
        // IMPORTANTE: Garante que user-sets sempre tenha TTL Infinity
        let ttl = config.ttl ?? DEFAULT_TTL;
        if (endpoint.includes('/user-sets') && ttl !== Infinity) {
          ttl = Infinity;
        }
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

        localStorage.setItem(cacheKey, JSON.stringify(entry));
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
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(CACHE_PREFIX)) {
          keysToRemove.push(key);
        }
      }
    } else if (pattern.startsWith('/')) {
      // Padrão de endpoint
      const normalizedPattern = pattern.replace(/^\//, '').replace(/\//g, '_');
      const regex = new RegExp(`^${CACHE_PREFIX}${normalizedPattern}`, 'i');

      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && regex.test(key)) {
          keysToRemove.push(key);
        }
      }
    } else {
      // Regex customizado
      const regex = new RegExp(pattern, 'i');

      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && regex.test(key)) {
          keysToRemove.push(key);
        }
      }
    }

    keysToRemove.forEach(key => localStorage.removeItem(key));

    // Atualiza estatísticas
    const stats = getCacheStatsInternal();
    stats.size = Object.keys(localStorage)
      .filter(key => key.startsWith(CACHE_PREFIX)).length;
    stats.totalSize = calculateCacheSize();
    localStorage.setItem(STATS_KEY, JSON.stringify(stats));
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
    ? Object.keys(localStorage).filter(key => key.startsWith(CACHE_PREFIX)).length
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
    localStorage.removeItem(STATS_KEY);
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

  // Relações usuário-item (verifica antes de listagens para evitar conflito)
  if (endpoint.includes('/user-sets')) {
    return CACHE_TTLS.USER_RELATIONS;
  }

  // Dashboard
  if (endpoint.includes('/dashboard')) {
    return CACHE_TTLS.DASHBOARD;
  }

  // Itens individuais (verifica ANTES de listagens estáticas)
  // Ex: /api/v1/armory/sets/123/ ou /api/v1/armory/armors/456/
  if (/\/(armors|sets|helmets|capes|passes)\/\d+/.test(endpoint)) {
    return CACHE_TTLS.ITEM_DETAIL;
  }

  // Listagens estáticas - verifica com e sem trailing slash
  // Ex: /api/v1/armory/sets OU /api/v1/armory/sets/
  // IMPORTANTE: Esta verificação vem depois da de itens individuais
  if (
    endpoint.includes('/passives') ||
    endpoint.includes('/passes') ||
    endpoint.includes('/sets') ||
    endpoint.includes('/armors') ||
    endpoint.includes('/helmets') ||
    endpoint.includes('/capes') ||
    endpoint.includes('/stratagems') ||
    endpoint.includes('/weaponry') ||
    endpoint.includes('/boosters')
  ) {
    return CACHE_TTLS.STATIC_LISTINGS;
  }

  // Padrão
  return DEFAULT_TTL;
}

/**
 * Verifica a versão global dos dados no servidor e invalida cache se necessário
 */
export async function checkGlobalVersion(): Promise<void> {
  if (typeof window === 'undefined') return;

  try {
    const { api } = await import('./api-cached');
    // Bypass cache para pegar a versão real
    const response = await api.get<{ updated_at: string }>('/api/v1/version/', {
      skipCache: true
    } as any);

    const serverVersion = response.data.updated_at;
    const localVersion = localStorage.getItem('global_version_timestamp');

    // Se não tem versão local, salva a do servidor e mantém o cache (primeira visita/limpeza)
    if (!localVersion) {
      localStorage.setItem('global_version_timestamp', serverVersion);
      return;
    }

    // Se a versão do servidor é diferente da local, invalida tudo
    if (serverVersion !== localVersion) {
      console.log('New content version detected. Clearing cache...', serverVersion);

      // Limpa todo o cache da API
      invalidateCache('*');

      // Atualiza o timestamp local
      localStorage.setItem('global_version_timestamp', serverVersion);

      // Opcional: Recarregar a página ou disparar evento para atualizar UI
      // window.location.reload(); 
    }
  } catch (error) {
    console.error('Failed to check global version:', error);
  }
}


