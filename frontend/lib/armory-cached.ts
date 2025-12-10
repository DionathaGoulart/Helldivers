/**
 * Funções de API relacionadas ao sistema de armaduras (Armory) com Cache
 * 
 * Versão otimizada com cache automático das funções em armory.ts
 */

import { cachedGet, cachedPost, cachedDelete } from './api-cached';
import { api } from './api-cached';
import { invalidateCache, getCachedData } from './cache';
import type {
  Passive,
  BattlePass,
  Armor,
  Helmet,
  Cape,
  ArmorSet,
  ArmorFilters,
  ItemFilters,
  SetFilters,
  RelationType,
  SetRelationStatus,
  FavoriteItem,
  PaginatedResponse,
} from './types/armory';

// ============================================================================
// FUNÇÕES DE API - ARMADURAS (COM CACHE)
// ============================================================================

/**
 * Busca todas as armaduras com filtros opcionais (com cache)
 */
export const getArmors = async (filters?: ArmorFilters): Promise<Armor[]> => {
  const params = new URLSearchParams();
  
  if (filters) {
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, String(value));
      }
    });
  }
  
  const response = await cachedGet<Armor[] | { results: Armor[] }>(
    `/api/v1/armory/armors/?${params.toString()}`,
    { checkForUpdates: true } as any
  );
  
  const data = response.data;
  return Array.isArray(data) ? data : data.results || [];
};

/**
 * Busca uma armadura específica por ID (com cache)
 */
export const getArmor = async (id: number): Promise<Armor> => {
  const response = await cachedGet<Armor>(
    `/api/v1/armory/armors/${id}/`,
    { checkForUpdates: true } as any
  );
  return response.data;
};

// ============================================================================
// FUNÇÕES DE API - CAPACETES (COM CACHE)
// ============================================================================

/**
 * Busca todos os capacetes com filtros opcionais (com cache)
 */
export const getHelmets = async (filters?: ItemFilters): Promise<Helmet[]> => {
  const params = new URLSearchParams();
  
  if (filters) {
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, String(value));
      }
    });
  }
  
  const response = await cachedGet<Helmet[] | { results: Helmet[] }>(
    `/api/v1/armory/helmets/?${params.toString()}`,
    { checkForUpdates: true } as any
  );
  
  const data = response.data;
  return Array.isArray(data) ? data : data.results || [];
};

// ============================================================================
// FUNÇÕES DE API - CAPAS (COM CACHE)
// ============================================================================

/**
 * Busca todas as capas com filtros opcionais (com cache)
 */
export const getCapes = async (filters?: ItemFilters): Promise<Cape[]> => {
  const params = new URLSearchParams();
  
  if (filters) {
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, String(value));
      }
    });
  }
  
  const response = await cachedGet<Cape[] | { results: Cape[] }>(
    `/api/v1/armory/capes/?${params.toString()}`,
    { checkForUpdates: true } as any
  );
  
  const data = response.data;
  return Array.isArray(data) ? data : data.results || [];
};

// ============================================================================
// FUNÇÕES DE API - PASSIVAS (COM CACHE)
// ============================================================================

/**
 * Busca todas as passivas disponíveis (com cache - dados estáticos)
 */
export const getPassives = async (): Promise<Passive[]> => {
  const response = await cachedGet<Passive[] | PaginatedResponse<Passive>>(
    '/api/v1/armory/passives/',
    { checkForUpdates: true } as any
  );
  
  const data = response.data;
  
  // Se é uma lista simples, retorna
  if (Array.isArray(data)) {
    return data;
  }
  
  // Se tem results, é paginada - busca todas as páginas
  if (data && typeof data === 'object' && 'results' in data) {
    const paginatedData = data as PaginatedResponse<Passive>;
    const allResults: Passive[] = [...paginatedData.results];
    
    // Se há próxima página, busca recursivamente (com cache)
    if (paginatedData.next) {
      const nextResponse = await cachedGet<PaginatedResponse<Passive>>(
        paginatedData.next,
        { checkForUpdates: true } as any
      );
      allResults.push(...nextResponse.data.results);
      
      // Continua buscando se ainda há mais páginas
      let currentNext = nextResponse.data.next;
      while (currentNext) {
        const moreResponse = await cachedGet<PaginatedResponse<Passive>>(
          currentNext,
          { checkForUpdates: true } as any
        );
        allResults.push(...moreResponse.data.results);
        currentNext = moreResponse.data.next;
      }
    }
    
    return allResults;
  }
  
  // Fallback: retorna array vazio se não for nenhum dos casos esperados
  return [];
};

// ============================================================================
// FUNÇÕES DE API - PASSES (COM CACHE)
// ============================================================================

/**
 * Busca todos os passes disponíveis (com cache - dados estáticos)
 */
export const getPasses = async (): Promise<BattlePass[]> => {
  const response = await cachedGet<BattlePass[] | { results: BattlePass[] }>(
    '/api/v1/armory/passes/',
    { checkForUpdates: true } as any
  );
  
  const data = response.data;
  return Array.isArray(data) ? data : data.results || [];
};

/**
 * Busca um passe específico por ID (com cache)
 */
export const getPass = async (id: number): Promise<BattlePass> => {
  const response = await cachedGet<BattlePass>(
    `/api/v1/armory/passes/${id}/`,
    { checkForUpdates: true } as any
  );
  return response.data;
};

// ============================================================================
// FUNÇÕES DE API - SETS (COM CACHE)
// ============================================================================

/**
 * Busca todos os sets com filtros opcionais (com cache)
 */
export const getSets = async (filters?: SetFilters): Promise<ArmorSet[]> => {
  const params = new URLSearchParams();
  
  if (filters) {
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, String(value));
      }
    });
  }
  
  const response = await cachedGet<ArmorSet[] | PaginatedResponse<ArmorSet>>(
    `/api/v1/armory/sets/?${params.toString()}`,
    { checkForUpdates: true } as any
  );
  
  const data = response.data;
  
  // Se é uma lista simples, retorna
  if (Array.isArray(data)) {
    return data;
  }
  
  // Se tem results, é paginada - busca todas as páginas
  if (data && typeof data === 'object' && 'results' in data) {
    const paginatedData = data as PaginatedResponse<ArmorSet>;
    const allResults: ArmorSet[] = [...paginatedData.results];
    
    // Se há próxima página, busca recursivamente (com cache)
    if (paginatedData.next) {
      const nextResponse = await cachedGet<PaginatedResponse<ArmorSet>>(
        paginatedData.next,
        { checkForUpdates: true } as any
      );
      allResults.push(...nextResponse.data.results);
      
      // Continua buscando se ainda há mais páginas
      let currentNext = nextResponse.data.next;
      while (currentNext) {
        const moreResponse = await cachedGet<PaginatedResponse<ArmorSet>>(
          currentNext,
          { checkForUpdates: true } as any
        );
        allResults.push(...moreResponse.data.results);
        currentNext = moreResponse.data.next;
      }
    }
    
    return allResults;
  }
  
  // Fallback: retorna array vazio se não for nenhum dos casos esperados
  return [];
};

/**
 * Busca um set específico por ID (com cache)
 */
export const getSet = async (id: number): Promise<ArmorSet> => {
  const response = await cachedGet<ArmorSet>(
    `/api/v1/armory/sets/${id}/`,
    { checkForUpdates: true } as any
  );
  return response.data;
};

// ============================================================================
// FUNÇÕES DE API - RELAÇÕES USUÁRIO-SET (COM CACHE)
// ============================================================================

/**
 * Adiciona uma relação (favorito, coleção ou wishlist) para um set
 * Atualiza cache otimisticamente sem invalidar dados de sets
 */
export const addSetRelation = async (
  armorSetId: number,
  relationType: RelationType
): Promise<void> => {
  await cachedPost('/api/v1/armory/user-sets/add/', {
    armor_set_id: armorSetId,
    relation_type: relationType,
  });
  
  // Busca o status atualizado diretamente do servidor (bypass cache)
  const { api, normalizeUrl, extractParams } = await import('./api-cached');
  const { setCachedData } = await import('./cache');
  const checkUrl = `/api/v1/armory/user-sets/check/?armor_set_id=${armorSetId}`;
  const response = await api.get<SetRelationStatus>(checkUrl);
  const updatedStatus = response.data;
  
  // Usa EXATAMENTE as mesmas funções que cachedGet usa para garantir chave idêntica
  const normalizedEndpoint = normalizeUrl(checkUrl);
  let params = extractParams(checkUrl);
  
  // Garante que armor_set_id seja sempre string (como vem da URL)
  // Isso é importante porque generateCacheKey compara valores estritamente
  if (params.armor_set_id !== undefined) {
    params = { ...params, armor_set_id: String(params.armor_set_id) };
  }
  
  // Atualiza o cache diretamente com os dados atualizados usando a mesma chave
  // IMPORTANTE: Salva o cache ANTES de qualquer outra operação para garantir
  // que seja encontrado imediatamente quando checkSetRelation for chamado
  setCachedData<SetRelationStatus>(normalizedEndpoint, updatedStatus, params, {
    ttl: Infinity, // Cache permanente para a sessão
  });
  
  // CRÍTICO: Atualiza também o cache das listagens completas (favorites/collection/wishlist)
  // Isso garante que após favoritar, as listas estejam atualizadas no cache
  // e serão encontradas corretamente após F5
  try {
    const listUrls = {
      favorite: '/api/v1/armory/user-sets/favorites/',
      collection: '/api/v1/armory/user-sets/collection/',
      wishlist: '/api/v1/armory/user-sets/wishlist/',
    };
    
    // Atualiza apenas a lista correspondente ao tipo de relação
    const urlToUpdate = listUrls[relationType];
    if (urlToUpdate) {
      // Bypass cache e busca do servidor para obter dados atualizados
      const { api } = await import('./api-cached');
      const { normalizeUrl } = await import('./api-cached');
      const { setCachedData } = await import('./cache');
      
      const response = await api.get<ArmorSet[] | { results: ArmorSet[] }>(urlToUpdate);
      const data = response.data;
      const setsList = Array.isArray(data) ? data : data.results || [];
      
      // Atualiza o cache da lista completa usando a mesma estrutura que cachedGet
      const normalizedListUrl = normalizeUrl(urlToUpdate);
      setCachedData<ArmorSet[]>(normalizedListUrl, setsList, {}, {
        ttl: Infinity, // Cache permanente para a sessão
        version: '1.0',
      });
    }
  } catch (error) {
    // Se der erro ao atualizar as listas, não bloqueia a operação principal
    // O cache do check já foi atualizado, então o status individual está correto
  }
};

/**
 * Remove uma relação (favorito, coleção ou wishlist) de um set
 * Atualiza cache otimisticamente sem invalidar dados de sets
 */
export const removeSetRelation = async (
  armorSetId: number,
  relationType: RelationType
): Promise<void> => {
  await cachedDelete('/api/v1/armory/user-sets/remove/', {
    data: {
      armor_set_id: armorSetId,
      relation_type: relationType,
    },
  });
  
  // Busca o status atualizado diretamente do servidor (bypass cache)
  const { api, normalizeUrl, extractParams } = await import('./api-cached');
  const { setCachedData } = await import('./cache');
  const checkUrl = `/api/v1/armory/user-sets/check/?armor_set_id=${armorSetId}`;
  const response = await api.get<SetRelationStatus>(checkUrl);
  const updatedStatus = response.data;
  
  // Usa EXATAMENTE as mesmas funções que cachedGet usa para garantir chave idêntica
  const normalizedEndpoint = normalizeUrl(checkUrl);
  let params = extractParams(checkUrl);
  
  // Garante que armor_set_id seja sempre string (como vem da URL)
  // Isso é importante porque generateCacheKey compara valores estritamente
  if (params.armor_set_id !== undefined) {
    params = { ...params, armor_set_id: String(params.armor_set_id) };
  }
  
  // Atualiza o cache diretamente com os dados atualizados usando a mesma chave
  // IMPORTANTE: Salva o cache ANTES de qualquer outra operação para garantir
  // que seja encontrado imediatamente quando checkSetRelation for chamado
  setCachedData<SetRelationStatus>(normalizedEndpoint, updatedStatus, params, {
    ttl: Infinity, // Cache permanente para a sessão
  });
  
  // CRÍTICO: Atualiza também o cache das listagens completas (favorites/collection/wishlist)
  // Isso garante que após desfavoritar, as listas estejam atualizadas no cache
  // e serão encontradas corretamente após F5
  try {
    const listUrls = {
      favorite: '/api/v1/armory/user-sets/favorites/',
      collection: '/api/v1/armory/user-sets/collection/',
      wishlist: '/api/v1/armory/user-sets/wishlist/',
    };
    
    // Atualiza apenas a lista correspondente ao tipo de relação
    const urlToUpdate = listUrls[relationType];
    if (urlToUpdate) {
      // Bypass cache e busca do servidor para obter dados atualizados
      const { api } = await import('./api-cached');
      const { normalizeUrl } = await import('./api-cached');
      const { setCachedData } = await import('./cache');
      
      const response = await api.get<ArmorSet[] | { results: ArmorSet[] }>(urlToUpdate);
      const data = response.data;
      const setsList = Array.isArray(data) ? data : data.results || [];
      
      // Atualiza o cache da lista completa usando a mesma estrutura que cachedGet
      const normalizedListUrl = normalizeUrl(urlToUpdate);
      setCachedData<ArmorSet[]>(normalizedListUrl, setsList, {}, {
        ttl: Infinity, // Cache permanente para a sessão
        version: '1.0',
      });
    }
  } catch (error) {
    // Se der erro ao atualizar as listas, não bloqueia a operação principal
    // O cache do check já foi atualizado, então o status individual está correto
  }
};

/**
 * Verifica o status de relações de um set (com cache)
 * Garante que o cache seja encontrado corretamente usando a mesma normalização
 * 
 * IMPORTANTE: Se o cache existir, NUNCA faz requisição ao servidor.
 * As requisições são feitas apenas na primeira vez por sessão.
 */
export const checkSetRelation = async (
  armorSetId: number,
  skipCache: boolean = false
): Promise<SetRelationStatus> => {
  const checkUrl = `/api/v1/armory/user-sets/check/?armor_set_id=${armorSetId}`;
  
  // Se skipCache for true, busca diretamente do servidor (bypass cache)
  if (skipCache) {
    const { api } = await import('./api-cached');
    const response = await api.get<SetRelationStatus>(checkUrl);
    return response.data;
  }
  
  // Tenta buscar do cache PRIMEIRO usando getCachedData diretamente
  // Isso é mais rápido que cachedGet porque não faz limpeza desnecessária
  const { normalizeUrl, extractParams } = await import('./api-cached');
  const { getCachedData } = await import('./cache');
  
  const normalizedEndpoint = normalizeUrl(checkUrl);
  const params = extractParams(checkUrl);
  
  // IMPORTANTE: Verifica o cache ANTES de qualquer coisa
  // Se encontrar cache válido, retorna imediatamente SEM fazer requisição
  const cachedData = getCachedData<SetRelationStatus>(normalizedEndpoint, params);
  
  if (cachedData !== null) {
    // Cache hit! Retorna imediatamente SEM fazer requisição
    return cachedData;
  }
  
  // Só faz requisição ao servidor se NÃO encontrar no cache
  // Isso deve acontecer apenas na primeira vez por sessão
  const response = await cachedGet<SetRelationStatus>(checkUrl);
  return response.data;
};

/**
 * Lista todos os sets favoritados pelo usuário (com cache)
 */
export const getFavoriteSets = async (): Promise<ArmorSet[]> => {
  const response = await cachedGet<ArmorSet[] | { results: ArmorSet[] }>(
    '/api/v1/armory/user-sets/favorites/'
  );
  
  const data = response.data;
  return Array.isArray(data) ? data : data.results || [];
};

/**
 * Lista todos os sets na coleção do usuário (com cache)
 */
export const getCollectionSets = async (): Promise<ArmorSet[]> => {
  const response = await cachedGet<ArmorSet[] | { results: ArmorSet[] }>(
    '/api/v1/armory/user-sets/collection/'
  );
  
  const data = response.data;
  return Array.isArray(data) ? data : data.results || [];
};

/**
 * Lista todos os sets na wishlist do usuário (com cache)
 */
export const getWishlistSets = async (): Promise<ArmorSet[]> => {
  const response = await cachedGet<ArmorSet[] | { results: ArmorSet[] }>(
    '/api/v1/armory/user-sets/wishlist/'
  );
  
  const data = response.data;
  return Array.isArray(data) ? data : data.results || [];
};

// ============================================================================
// FUNÇÕES DE FAVORITOS (LocalStorage) - Compatibilidade
// ============================================================================

const FAVORITES_KEY = 'helldivers_favorites';

export const getFavorites = (): FavoriteItem[] => {
  if (typeof window === 'undefined') return [];
  
  const stored = localStorage.getItem(FAVORITES_KEY);
  return stored ? JSON.parse(stored) : [];
};

export const addFavorite = (item: FavoriteItem): void => {
  const favorites = getFavorites();
  
  const exists = favorites.some(
    (fav) => fav.type === item.type && fav.id === item.id
  );
  if (exists) return;
  
  favorites.push(item);
  localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
};

export const removeFavorite = (type: FavoriteItem['type'], id: number): void => {
  const favorites = getFavorites();
  const updated = favorites.filter(
    (fav) => !(fav.type === type && fav.id === id)
  );
  localStorage.setItem(FAVORITES_KEY, JSON.stringify(updated));
};

export const isFavorite = (type: FavoriteItem['type'], id: number): boolean => {
  const favorites = getFavorites();
  return favorites.some((fav) => fav.type === type && fav.id === id);
};

export const getFavoritesByType = (type: FavoriteItem['type']): FavoriteItem[] => {
  const favorites = getFavorites();
  return favorites.filter((fav) => fav.type === type);
};

// Re-exportar types
export type {
  Passive,
  BattlePass,
  Armor,
  Helmet,
  Cape,
  ArmorSet,
  RelationType,
  SetRelationStatus,
  ArmorFilters,
  ItemFilters,
  SetFilters,
  FavoriteItem,
  PaginatedResponse,
} from './types/armory';

