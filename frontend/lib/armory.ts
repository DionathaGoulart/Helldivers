import api from './api';

// ==================== TYPES ====================

export interface Passive {
  id: number;
  name: string;
  description: string;
  effect: string;
}

export interface Armor {
  id: number;
  name: string;
  category: 'light' | 'medium' | 'heavy';
  category_display: string;
  image?: string;
  armor: 'low' | 'medium' | 'high';
  armor_display: string;
  speed: 'low' | 'medium' | 'high';
  speed_display: string;
  stamina: 'low' | 'medium' | 'high';
  stamina_display: string;
  passive?: number;
  passive_detail?: Passive;
  cost: number;
  source: 'store' | 'pass';
  source_display: string;
  cost_currency: string;
}

export interface Helmet {
  id: number;
  name: string;
  image?: string;
  cost: number;
  source: 'store' | 'pass';
  source_display: string;
  cost_currency: string;
}

export interface Cape {
  id: number;
  name: string;
  image?: string;
  cost: number;
  source: 'store' | 'pass';
  source_display: string;
  cost_currency: string;
}

export interface ArmorStats {
  armor?: 'low' | 'medium' | 'high';
  armor_display?: string;
  speed?: 'low' | 'medium' | 'high';
  speed_display?: string;
  stamina?: 'low' | 'medium' | 'high';
  stamina_display?: string;
  category?: 'light' | 'medium' | 'heavy';
  category_display?: string;
}

export interface ArmorSet {
  id: number;
  name: string;
  image?: string;
  helmet: number;
  helmet_detail: Helmet;
  armor: number;
  armor_detail: Armor;
  cape: number;
  cape_detail: Cape;
  passive_detail?: Passive;
  armor_stats?: ArmorStats;
  source?: string;
  total_cost: number;
}

// ==================== API FUNCTIONS ====================

export interface ArmorFilters {
  category?: 'light' | 'medium' | 'heavy';
  armor?: 'low' | 'medium' | 'high';
  speed?: 'low' | 'medium' | 'high';
  stamina?: 'low' | 'medium' | 'high';
  passive?: number;
  cost__lte?: number;
  cost__gte?: number;
  search?: string;
  ordering?: 'name' | 'cost' | '-name' | '-cost';
}

export const getArmors = async (filters?: ArmorFilters) => {
  const params = new URLSearchParams();
  
  if (filters) {
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, String(value));
      }
    });
  }
  
  const response = await api.get(`/api/v1/armory/armors/?${params.toString()}`);
  // Se retornar paginação, pegar o array results
  return Array.isArray(response.data) ? response.data : response.data.results || [];
};

export const getArmor = async (id: number) => {
  const response = await api.get(`/api/v1/armory/armors/${id}/`);
  return response.data;
};

export const getHelmets = async (filters?: { cost__lte?: number; cost__gte?: number; search?: string; ordering?: string }) => {
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

export const getCapes = async (filters?: { cost__lte?: number; cost__gte?: number; search?: string; ordering?: string }) => {
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

export const getPassives = async () => {
  const response = await api.get('/api/v1/armory/passives/');
  return Array.isArray(response.data) ? response.data : response.data.results || [];
};

export const getSets = async (filters?: { search?: string; ordering?: string }) => {
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

export const getSet = async (id: number) => {
  const response = await api.get(`/api/v1/armory/sets/${id}/`);
  return response.data;
};

// ==================== USER SET RELATIONS (API) ====================

export type RelationType = 'favorite' | 'collection' | 'wishlist';

export interface SetRelationStatus {
  favorite: boolean;
  collection: boolean;
  wishlist: boolean;
}

/**
 * Adiciona uma relação (favorito, coleção ou wishlist) para um set
 */
export const addSetRelation = async (armorSetId: number, relationType: RelationType): Promise<void> => {
  await api.post('/api/v1/armory/user-sets/add/', {
    armor_set_id: armorSetId,
    relation_type: relationType,
  });
};

/**
 * Remove uma relação (favorito, coleção ou wishlist) de um set
 */
export const removeSetRelation = async (armorSetId: number, relationType: RelationType): Promise<void> => {
  await api.delete('/api/v1/armory/user-sets/remove/', {
    data: {
      armor_set_id: armorSetId,
      relation_type: relationType,
    },
  });
};

/**
 * Verifica o status de relações de um set
 */
export const checkSetRelation = async (armorSetId: number): Promise<SetRelationStatus> => {
  const response = await api.get(`/api/v1/armory/user-sets/check/?armor_set_id=${armorSetId}`);
  return response.data;
};

/**
 * Lista todos os sets favoritados pelo usuário
 */
export const getFavoriteSets = async (): Promise<ArmorSet[]> => {
  const response = await api.get('/api/v1/armory/user-sets/favorites/');
  return Array.isArray(response.data) ? response.data : response.data.results || [];
};

/**
 * Lista todos os sets na coleção do usuário
 */
export const getCollectionSets = async (): Promise<ArmorSet[]> => {
  const response = await api.get('/api/v1/armory/user-sets/collection/');
  return Array.isArray(response.data) ? response.data : response.data.results || [];
};

/**
 * Lista todos os sets na wishlist do usuário
 */
export const getWishlistSets = async (): Promise<ArmorSet[]> => {
  const response = await api.get('/api/v1/armory/user-sets/wishlist/');
  return Array.isArray(response.data) ? response.data : response.data.results || [];
};

// ==================== FAVORITES (LocalStorage) - Mantido para compatibilidade ====================

export interface FavoriteItem {
  type: 'armor' | 'helmet' | 'cape' | 'set';
  id: number;
  name: string;
  image?: string;
}

const FAVORITES_KEY = 'helldivers_favorites';

export const getFavorites = (): FavoriteItem[] => {
  if (typeof window === 'undefined') return [];
  
  const stored = localStorage.getItem(FAVORITES_KEY);
  return stored ? JSON.parse(stored) : [];
};

export const addFavorite = (item: FavoriteItem) => {
  const favorites = getFavorites();
  
  // Verificar se já existe
  const exists = favorites.some(fav => fav.type === item.type && fav.id === item.id);
  if (exists) return;
  
  favorites.push(item);
  localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
};

export const removeFavorite = (type: FavoriteItem['type'], id: number) => {
  const favorites = getFavorites();
  const updated = favorites.filter(fav => !(fav.type === type && fav.id === id));
  localStorage.setItem(FAVORITES_KEY, JSON.stringify(updated));
};

export const isFavorite = (type: FavoriteItem['type'], id: number): boolean => {
  const favorites = getFavorites();
  return favorites.some(fav => fav.type === type && fav.id === id);
};

export const getFavoritesByType = (type: FavoriteItem['type']): FavoriteItem[] => {
  const favorites = getFavorites();
  return favorites.filter(fav => fav.type === type);
};

