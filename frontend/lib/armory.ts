/**
 * Funções de API relacionadas ao sistema de armaduras (Armory)
 */

import api from './api';
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
} from './types/armory';

// ============================================================================
// CONSTANTES
// ============================================================================

const FAVORITES_KEY = 'helldivers_favorites';

// ============================================================================
// FUNÇÕES DE API - ARMADURAS
// ============================================================================

/**
 * Busca todas as armaduras com filtros opcionais
 * @param filters - Filtros de busca (categoria, custo, etc.)
 * @returns Lista de armaduras
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
  
  const response = await api.get(`/api/v1/armory/armors/?${params.toString()}`);
  return Array.isArray(response.data) ? response.data : response.data.results || [];
};

/**
 * Busca uma armadura específica por ID
 * @param id - ID da armadura
 * @returns Dados da armadura
 */
export const getArmor = async (id: number): Promise<Armor> => {
  const response = await api.get(`/api/v1/armory/armors/${id}/`);
  return response.data;
};

// ============================================================================
// FUNÇÕES DE API - CAPACETES
// ============================================================================

/**
 * Busca todos os capacetes com filtros opcionais
 * @param filters - Filtros de busca (custo, busca, ordenação)
 * @returns Lista de capacetes
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
  
  const response = await api.get(`/api/v1/armory/helmets/?${params.toString()}`);
  return Array.isArray(response.data) ? response.data : response.data.results || [];
};

// ============================================================================
// FUNÇÕES DE API - CAPAS
// ============================================================================

/**
 * Busca todas as capas com filtros opcionais
 * @param filters - Filtros de busca (custo, busca, ordenação)
 * @returns Lista de capas
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
  
  const response = await api.get(`/api/v1/armory/capes/?${params.toString()}`);
  return Array.isArray(response.data) ? response.data : response.data.results || [];
};

// ============================================================================
// FUNÇÕES DE API - PASSIVAS
// ============================================================================

/**
 * Busca todas as passivas disponíveis
 * @returns Lista de passivas
 */
export const getPassives = async (): Promise<Passive[]> => {
  const response = await api.get('/api/v1/armory/passives/');
  return Array.isArray(response.data) ? response.data : response.data.results || [];
};

// ============================================================================
// FUNÇÕES DE API - PASSES
// ============================================================================

/**
 * Busca todos os passes disponíveis
 * @returns Lista de passes
 */
export const getPasses = async (): Promise<BattlePass[]> => {
  const response = await api.get('/api/v1/armory/passes/');
  return Array.isArray(response.data) ? response.data : response.data.results || [];
};

/**
 * Busca um passe específico por ID
 * @param id - ID do passe
 * @returns Dados do passe
 */
export const getPass = async (id: number): Promise<BattlePass> => {
  const response = await api.get(`/api/v1/armory/passes/${id}/`);
  return response.data;
};

// ============================================================================
// FUNÇÕES DE API - SETS
// ============================================================================

/**
 * Busca todos os sets com filtros opcionais
 * @param filters - Filtros de busca (busca, ordenação)
 * @returns Lista de sets
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
  
  const response = await api.get(`/api/v1/armory/sets/?${params.toString()}`);
  return Array.isArray(response.data) ? response.data : response.data.results || [];
};

/**
 * Busca um set específico por ID
 * @param id - ID do set
 * @returns Dados do set
 */
export const getSet = async (id: number): Promise<ArmorSet> => {
  const response = await api.get(`/api/v1/armory/sets/${id}/`);
  return response.data;
};

// ============================================================================
// FUNÇÕES DE API - RELAÇÕES USUÁRIO-SET
// ============================================================================

/**
 * Adiciona uma relação (favorito, coleção ou wishlist) para um set
 * @param armorSetId - ID do set de armadura
 * @param relationType - Tipo de relação (favorite, collection, wishlist)
 */
export const addSetRelation = async (
  armorSetId: number,
  relationType: RelationType
): Promise<void> => {
  await api.post('/api/v1/armory/user-sets/add/', {
    armor_set_id: armorSetId,
    relation_type: relationType,
  });
};

/**
 * Remove uma relação (favorito, coleção ou wishlist) de um set
 * @param armorSetId - ID do set de armadura
 * @param relationType - Tipo de relação
 */
export const removeSetRelation = async (
  armorSetId: number,
  relationType: RelationType
): Promise<void> => {
  await api.delete('/api/v1/armory/user-sets/remove/', {
    data: {
      armor_set_id: armorSetId,
      relation_type: relationType,
    },
  });
};

/**
 * Verifica o status de relações de um set
 * @param armorSetId - ID do set de armadura
 * @returns Status de todas as relações (favorite, collection, wishlist)
 */
export const checkSetRelation = async (
  armorSetId: number
): Promise<SetRelationStatus> => {
  const response = await api.get(
    `/api/v1/armory/user-sets/check/?armor_set_id=${armorSetId}`
  );
  return response.data;
};

/**
 * Lista todos os sets favoritados pelo usuário
 * @returns Lista de sets favoritados
 */
export const getFavoriteSets = async (): Promise<ArmorSet[]> => {
  const response = await api.get('/api/v1/armory/user-sets/favorites/');
  return Array.isArray(response.data) ? response.data : response.data.results || [];
};

/**
 * Lista todos os sets na coleção do usuário
 * @returns Lista de sets na coleção
 */
export const getCollectionSets = async (): Promise<ArmorSet[]> => {
  const response = await api.get('/api/v1/armory/user-sets/collection/');
  return Array.isArray(response.data) ? response.data : response.data.results || [];
};

/**
 * Lista todos os sets na wishlist do usuário
 * @returns Lista de sets na wishlist
 */
export const getWishlistSets = async (): Promise<ArmorSet[]> => {
  const response = await api.get('/api/v1/armory/user-sets/wishlist/');
  return Array.isArray(response.data) ? response.data : response.data.results || [];
};

// ============================================================================
// FUNÇÕES DE FAVORITOS (LocalStorage) - Compatibilidade
// ============================================================================

/**
 * Obtém todos os favoritos armazenados localmente
 * @returns Lista de itens favoritos
 */
export const getFavorites = (): FavoriteItem[] => {
  if (typeof window === 'undefined') return [];
  
  const stored = localStorage.getItem(FAVORITES_KEY);
  return stored ? JSON.parse(stored) : [];
};

/**
 * Adiciona um item aos favoritos locais
 * @param item - Item a ser favoritado
 */
export const addFavorite = (item: FavoriteItem): void => {
  const favorites = getFavorites();
  
  const exists = favorites.some(
    (fav) => fav.type === item.type && fav.id === item.id
  );
  if (exists) return;
  
  favorites.push(item);
  localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
};

/**
 * Remove um item dos favoritos locais
 * @param type - Tipo do item (armor, helmet, cape, set)
 * @param id - ID do item
 */
export const removeFavorite = (type: FavoriteItem['type'], id: number): void => {
  const favorites = getFavorites();
  const updated = favorites.filter(
    (fav) => !(fav.type === type && fav.id === id)
  );
  localStorage.setItem(FAVORITES_KEY, JSON.stringify(updated));
};

/**
 * Verifica se um item está nos favoritos locais
 * @param type - Tipo do item
 * @param id - ID do item
 * @returns true se o item está favoritado
 */
export const isFavorite = (type: FavoriteItem['type'], id: number): boolean => {
  const favorites = getFavorites();
  return favorites.some((fav) => fav.type === type && fav.id === id);
};

/**
 * Obtém favoritos filtrados por tipo
 * @param type - Tipo de item para filtrar
 * @returns Lista de favoritos do tipo especificado
 */
export const getFavoritesByType = (type: FavoriteItem['type']): FavoriteItem[] => {
  const favorites = getFavorites();
  return favorites.filter((fav) => fav.type === type);
};

// Re-exportar types para compatibilidade
export type {
  Passive,
  BattlePass,
  Armor,
  Helmet,
  Cape,
  ArmorSet,
  ArmorStats,
  RelationType,
  SetRelationStatus,
  ArmorFilters,
  ItemFilters,
  SetFilters,
  FavoriteItem,
} from './types/armory';
