/**
 * Types relacionados ao sistema de armaduras (Armory)
 */

// ============================================================================
// MODELOS DE DADOS
// ============================================================================

/**
 * Modelo de Passiva
 */
export interface Passive {
  id: number;
  name: string;
  description: string;
  effect: string;
}

/**
 * Modelo de Passe de Batalha
 */
export interface BattlePass {
  id: number;
  name: string;
  image?: string;
  creditos_ganhaveis: number;
  custo_medalhas_todas_paginas: number;
  custo_medalhas_todos_itens: number;
  quantidade_paginas: number;
  custo_supercreditos: number;
  created_at: string;
  updated_at: string;
}

/**
 * Modelo de Armadura
 */
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
  pass_field?: number;
  pass_detail?: BattlePass;
  cost_currency: string;
}

/**
 * Modelo de Capacete
 */
export interface Helmet {
  id: number;
  name: string;
  image?: string;
  cost: number;
  source: 'store' | 'pass';
  source_display: string;
  pass_field?: number;
  pass_detail?: BattlePass;
  cost_currency: string;
}

/**
 * Modelo de Capa
 */
export interface Cape {
  id: number;
  name: string;
  image?: string;
  cost: number;
  source: 'store' | 'pass';
  source_display: string;
  pass_field?: number;
  pass_detail?: BattlePass;
  cost_currency: string;
}

/**
 * Estatísticas de Armadura
 */
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

/**
 * Modelo de Set de Armadura (conjunto completo)
 */
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
  pass_detail?: BattlePass;
  armor_stats?: ArmorStats;
  source?: string;
  total_cost: number;
}

// ============================================================================
// RELAÇÕES USUÁRIO-SET
// ============================================================================

/**
 * Tipo de relação entre usuário e set
 */
export type RelationType = 'favorite' | 'collection' | 'wishlist';

/**
 * Status de relações de um set
 */
export interface SetRelationStatus {
  favorite: boolean;
  collection: boolean;
  wishlist: boolean;
}

// ============================================================================
// FILTROS E PARÂMETROS
// ============================================================================

/**
 * Filtros para busca de armaduras
 */
export interface ArmorFilters {
  category?: 'light' | 'medium' | 'heavy';
  armor?: 'low' | 'medium' | 'high';
  speed?: 'low' | 'medium' | 'high';
  stamina?: 'low' | 'medium' | 'high';
  passive?: number;
  source?: 'store' | 'pass';
  pass_field?: number;
  cost__lte?: number;
  cost__gte?: number;
  search?: string;
  ordering?: 'name' | 'cost' | '-name' | '-cost';
}

/**
 * Filtros genéricos para capacetes e capas
 */
export interface ItemFilters {
  source?: 'store' | 'pass';
  pass_field?: number;
  cost__lte?: number;
  cost__gte?: number;
  search?: string;
  ordering?: string;
}

/**
 * Filtros para busca de sets
 */
export interface SetFilters {
  search?: string;
  ordering?: string;
}

// ============================================================================
// FAVORITOS (LocalStorage) - Compatibilidade
// ============================================================================

/**
 * Item favorito armazenado localmente
 */
export interface FavoriteItem {
  type: 'armor' | 'helmet' | 'cape' | 'set';
  id: number;
  name: string;
  image?: string;
}
