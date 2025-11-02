/**
 * Funções de API relacionadas ao sistema de armaduras (Armory) com Cache
 * 
 * Versão otimizada com cache automático das funções em armory.ts
 */

import { cachedGet, cachedPost, cachedDelete } from './api-cached';
import { api } from './api-cached';
import { invalidateCache } from './cache';
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
    `/api/v1/armory/armors/?${params.toString()}`
  );
  
  const data = response.data;
  return Array.isArray(data) ? data : data.results || [];
};

/**
 * Busca uma armadura específica por ID (com cache)
 */
export const getArmor = async (id: number): Promise<Armor> => {
  const response = await cachedGet<Armor>(`/api/v1/armory/armors/${id}/`);
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
    `/api/v1/armory/helmets/?${params.toString()}`
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
    `/api/v1/armory/capes/?${params.toString()}`
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
  const response = await cachedGet<Passive[] | { results: Passive[] }>(
    '/api/v1/armory/passives/'
  );
  
  const data = response.data;
  return Array.isArray(data) ? data : data.results || [];
};

// ============================================================================
// FUNÇÕES DE API - PASSES (COM CACHE)
// ============================================================================

/**
 * Busca todos os passes disponíveis (com cache - dados estáticos)
 */
export const getPasses = async (): Promise<BattlePass[]> => {
  const response = await cachedGet<BattlePass[] | { results: BattlePass[] }>(
    '/api/v1/armory/passes/'
  );
  
  const data = response.data;
  return Array.isArray(data) ? data : data.results || [];
};

/**
 * Busca um passe específico por ID (com cache)
 */
export const getPass = async (id: number): Promise<BattlePass> => {
  const response = await cachedGet<BattlePass>(`/api/v1/armory/passes/${id}/`);
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
    `/api/v1/armory/sets/?${params.toString()}`
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
      const nextResponse = await cachedGet<PaginatedResponse<ArmorSet>>(paginatedData.next);
      allResults.push(...nextResponse.data.results);
      
      // Continua buscando se ainda há mais páginas
      let currentNext = nextResponse.data.next;
      while (currentNext) {
        const moreResponse = await cachedGet<PaginatedResponse<ArmorSet>>(currentNext);
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
  const response = await cachedGet<ArmorSet>(`/api/v1/armory/sets/${id}/`);
  return response.data;
};

// ============================================================================
// FUNÇÕES DE API - RELAÇÕES USUÁRIO-SET (COM CACHE)
// ============================================================================

/**
 * Adiciona uma relação (favorito, coleção ou wishlist) para um set
 * Invalida cache automaticamente
 */
export const addSetRelation = async (
  armorSetId: number,
  relationType: RelationType
): Promise<void> => {
  await cachedPost('/api/v1/armory/user-sets/add/', {
    armor_set_id: armorSetId,
    relation_type: relationType,
  });
  
  // Invalida cache específico do check para este set
  invalidateCache(`/api/v1/armory/user-sets/check?armor_set_id=${armorSetId}`);
};

/**
 * Remove uma relação (favorito, coleção ou wishlist) de um set
 * Invalida cache automaticamente
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
  
  // Invalida cache específico do check para este set
  invalidateCache(`/api/v1/armory/user-sets/check?armor_set_id=${armorSetId}`);
};

/**
 * Verifica o status de relações de um set (com cache)
 */
export const checkSetRelation = async (
  armorSetId: number
): Promise<SetRelationStatus> => {
  const response = await cachedGet<SetRelationStatus>(
    `/api/v1/armory/user-sets/check/?armor_set_id=${armorSetId}`
  );
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

