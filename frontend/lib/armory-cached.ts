/**
 * Funções de API relacionadas ao sistema de armaduras (Armory) com Cache
 * 
 * Versão otimizada com cache automático das funções em armory.ts
 */

import { cachedGet, cachedPost, cachedDelete } from './api-cached';
import { api } from './api-cached';
import { invalidateCache, getCachedData, CacheConfig } from './cache';
import type {
  Passive,
  BattlePass,
  Armor,
  Helmet,
  Cape,
  ArmorSet,
  Stratagem,
  ArmorFilters,
  ItemFilters,
  SetFilters,
  RelationType,
  SetRelationStatus,
  FavoriteItem,
  PaginatedResponse,
  Booster,
} from './types/armory';

// ============================================================================
// FUNÇÕES DE API - BOOSTERS (COM CACHE)
// ============================================================================

/**
 * Busca todos os boosters (com cache)
 */
export const getBoosters = async (config?: any): Promise<Booster[]> => {
  const response = await cachedGet<Booster[]>('/api/db/boosters/', { checkForUpdates: true, ...config } as any);
  return response.data || [];
};

// ============================================================================
// FUNÇÕES DE API - ARMADURAS (COM CACHE)
// ============================================================================

// Helper for filtering and sorting
const filterAndSortItems = <T extends any>(
  items: T[],
  filters: ItemFilters | ArmorFilters | undefined,
  type: 'armor' | 'helmet' | 'cape' | 'set' | 'stratagem'
): T[] => {
  if (!filters) return items;

  let filtered = [...items];

  // 1. Search (Name)
  if (filters.search) {
    const searchLower = filters.search.toLowerCase();
    filtered = filtered.filter((item: any) =>
      (item.name && item.name.toLowerCase().includes(searchLower)) ||
      (item.name_pt_br && item.name_pt_br.toLowerCase().includes(searchLower))
    );
  }

  // 2. Source & Warbond
  if (filters.source) {
    filtered = filtered.filter((item: any) => {
      if (filters.source === 'store') return item.source === 'store';
      if (filters.source === 'pass') return item.source === 'pass';
      return true;
    });
  }

  if (filters.pass_field) {
    filtered = filtered.filter((item: any) => item.pass_field === filters.pass_field);
  }

  // 3. Category (Armor only)
  if (type === 'armor' && (filters as ArmorFilters).category) {
    filtered = filtered.filter((item: any) => item.category === (filters as ArmorFilters).category);
  }

  // 4. Sorting
  if (filters.ordering) {
    const { ordering } = filters;
    filtered.sort((a: any, b: any) => {
      // Determine value to sort by
      let valA, valB;

      // Handle simple fields
      if (ordering === 'name' || ordering === '-name') {
        // TODO: Handle localization if needed, defaulting to name
        valA = a.name || '';
        valB = b.name || '';
      } else if (ordering === 'cost' || ordering === '-cost') {
        valA = a.cost || 0;
        valB = b.cost || 0;
      } else if (type === 'armor' || type === 'helmet') { // Helmets/Armors have stats
         if (ordering === 'armor' || ordering === '-armor') {
             valA = a.armor || 0;
             valB = b.armor || 0;
         } else if (ordering === 'speed' || ordering === '-speed') {
             valA = a.speed || 0;
             valB = b.speed || 0;
         } else if (ordering === 'stamina' || ordering === '-stamina') {
             valA = a.stamina || 0;
             valB = b.stamina || 0;
         }
      }

      // Default string compare if val is string
      if (typeof valA === 'string' && typeof valB === 'string') {
        return ordering.startsWith('-') ? valB.localeCompare(valA) : valA.localeCompare(valB);
      }
      // Numeric compare
      return ordering.startsWith('-') ? (valB as number) - (valA as number) : (valA as number) - (valB as number);
    });
  }

  return filtered;
};

// ============================================================================
// FUNÇÕES DE API - ARMADURAS (COM CACHE)
// ============================================================================

/**
 * Busca todas as armaduras com filtros opcionais (com cache)
 */
export const getArmors = async (filters?: ArmorFilters, config?: any): Promise<Armor[]> => {
  const response = await cachedGet<Armor[]>(`/api/db/armory/?type=armor`, { checkForUpdates: true, ...config } as any);
  let data = response.data || [];
  return filterAndSortItems(data, filters, 'armor');
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
export const getHelmets = async (filters?: ItemFilters, config?: any): Promise<Helmet[]> => {
  const response = await cachedGet<Helmet[]>(`/api/db/armory/?type=helmet`, { checkForUpdates: true, ...config } as any);
  let data = response.data || [];
  return filterAndSortItems(data, filters, 'helmet');
};

// ============================================================================
// FUNÇÕES DE API - CAPAS (COM CACHE)
// ============================================================================

/**
 * Busca todas as capas com filtros opcionais (com cache)
 */
export const getCapes = async (filters?: ItemFilters, config?: any): Promise<Cape[]> => {
  const response = await cachedGet<Cape[]>(`/api/db/armory/?type=cape`, { checkForUpdates: true, ...config } as any);
  let data = response.data || [];
  return filterAndSortItems(data, filters, 'cape');
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
    '/api/v1/warbonds/warbonds/',
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
    `/api/v1/warbonds/warbonds/${id}/`,
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
export const getSets = async (filters?: SetFilters, config?: any): Promise<ArmorSet[]> => {
  const response = await cachedGet<ArmorSet[]>(`/api/db/armory/?type=set`, { checkForUpdates: true, ...config } as any);
  return response.data || [];
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
import { supabase } from '@/lib/supabase';

/**
 * Helper to fetch a Set of item_id from Supabase user_relations
 */
const getSupabaseIds = async (type: string, relationType: RelationType): Promise<Set<string>> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return new Set();
  const { data, error } = await supabase.from('user_relations')
    .select('item_id')
    .match({ user_id: user.id, item_type: type, relation_type: relationType });
  if (error) {
    console.error(`Error fetching ${relationType} for ${type}:`, error);
    return new Set();
  }
  return new Set(data.map(d => d.item_id));
};

// ============================================================================
// FUNÇÕES DE API - LISTAGEM DE RELAÇÕES (COM SUPABASE)
// ============================================================================

// Sets
export const getFavoriteSets = async (): Promise<ArmorSet[]> => {
  const ids = await getSupabaseIds('set', 'favorite');
  if (ids.size === 0) return [];
  const items = await getSets();
  return items.filter(item => ids.has(String(item.id)));
};

export const getCollectionSets = async (): Promise<ArmorSet[]> => {
  const ids = await getSupabaseIds('set', 'collection');
  if (ids.size === 0) return [];
  const items = await getSets();
  return items.filter(item => ids.has(String(item.id)));
};

export const getWishlistSets = async (): Promise<ArmorSet[]> => {
  const ids = await getSupabaseIds('set', 'wishlist');
  if (ids.size === 0) return [];
  const items = await getSets();
  return items.filter(item => ids.has(String(item.id)));
};

// Capacetes (Helmets)
export const getFavoriteHelmets = async (): Promise<Helmet[]> => {
  const ids = await getSupabaseIds('helmet', 'favorite');
  if (ids.size === 0) return [];
  const items = await getHelmets();
  return items.filter(item => ids.has(String(item.id)));
};

export const getCollectionHelmets = async (): Promise<Helmet[]> => {
  const ids = await getSupabaseIds('helmet', 'collection');
  if (ids.size === 0) return [];
  const items = await getHelmets();
  return items.filter(item => ids.has(String(item.id)));
};

export const getWishlistHelmets = async (): Promise<Helmet[]> => {
  const ids = await getSupabaseIds('helmet', 'wishlist');
  if (ids.size === 0) return [];
  const items = await getHelmets();
  return items.filter(item => ids.has(String(item.id)));
};

// Armaduras (Armors)
export const getFavoriteArmors = async (): Promise<Armor[]> => {
  const ids = await getSupabaseIds('armor', 'favorite');
  if (ids.size === 0) return [];
  const items = await getArmors();
  return items.filter(item => ids.has(String(item.id)));
};

export const getCollectionArmors = async (): Promise<Armor[]> => {
  const ids = await getSupabaseIds('armor', 'collection');
  if (ids.size === 0) return [];
  const items = await getArmors();
  return items.filter(item => ids.has(String(item.id)));
};

export const getWishlistArmors = async (): Promise<Armor[]> => {
  const ids = await getSupabaseIds('armor', 'wishlist');
  if (ids.size === 0) return [];
  const items = await getArmors();
  return items.filter(item => ids.has(String(item.id)));
};

// Capas (Capes)
export const getFavoriteCapes = async (): Promise<Cape[]> => {
  const ids = await getSupabaseIds('cape', 'favorite');
  if (ids.size === 0) return [];
  const items = await getCapes();
  return items.filter(item => ids.has(String(item.id)));
};

export const getCollectionCapes = async (): Promise<Cape[]> => {
  const ids = await getSupabaseIds('cape', 'collection');
  if (ids.size === 0) return [];
  const items = await getCapes();
  return items.filter(item => ids.has(String(item.id)));
};

export const getWishlistCapes = async (): Promise<Cape[]> => {
  const ids = await getSupabaseIds('cape', 'wishlist');
  if (ids.size === 0) return [];
  const items = await getCapes();
  return items.filter(item => ids.has(String(item.id)));
};

// ============================================================================
// FUNÇÕES DE API - ESTRATAGEMAS (COM CACHE)
// ============================================================================

/**
 * Busca todos os estratagemas com filtros opcionais (com cache)
 */
export const getStratagems = async (filters?: any, config?: any): Promise<Stratagem[]> => {
  const response = await cachedGet<Stratagem[]>('/api/db/stratagems', { checkForUpdates: true, ...config } as any);
  return response.data || [];
};

// ============================================================================
// FUNÇÕES DE API - RELAÇÕES ESTRATAGEMAS & BOOSTERS (COM SUPABASE)
// ============================================================================

export const getFavoriteStratagems = async (): Promise<Stratagem[]> => {
  const ids = await getSupabaseIds('stratagem', 'favorite');
  if (ids.size === 0) return [];
  const items = await getStratagems();
  return items.filter(item => ids.has(String(item.id)));
};

export const getCollectionStratagems = async (): Promise<Stratagem[]> => {
  const ids = await getSupabaseIds('stratagem', 'collection');
  if (ids.size === 0) return [];
  const items = await getStratagems();
  return items.filter(item => ids.has(String(item.id)));
};

export const getWishlistStratagems = async (): Promise<Stratagem[]> => {
  const ids = await getSupabaseIds('stratagem', 'wishlist');
  if (ids.size === 0) return [];
  const items = await getStratagems();
  return items.filter(item => ids.has(String(item.id)));
};

export const getFavoriteBoosters = async (): Promise<Booster[]> => {
  const ids = await getSupabaseIds('booster', 'favorite');
  if (ids.size === 0) return [];
  const items = await getBoosters();
  return items.filter(item => ids.has(String(item.id)));
};

export const getCollectionBoosters = async (): Promise<Booster[]> => {
  const ids = await getSupabaseIds('booster', 'collection');
  if (ids.size === 0) return [];
  const items = await getBoosters();
  return items.filter(item => ids.has(String(item.id)));
};

export const getWishlistBoosters = async (): Promise<Booster[]> => {
  const ids = await getSupabaseIds('booster', 'wishlist');
  if (ids.size === 0) return [];
  const items = await getBoosters();
  return items.filter(item => ids.has(String(item.id)));
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

