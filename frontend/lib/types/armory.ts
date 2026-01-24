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
  name_pt_br?: string;
  description: string;
  description_pt_br?: string;
  effect: string;
  effect_pt_br?: string;
  image?: string;
}

/**
 * Modelo de Passe de Batalha
 */
export interface BattlePass {
  id: number;
  name: string;
  name_pt_br?: string;
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
 * Modelo de Fonte de Aquisição
 */
export interface AcquisitionSource {
  id: number;
  name: string;
  name_pt_br?: string;
  is_event: boolean;
  description: string;
}

/**
 * Modelo de Fonte de Aquisição
 */
export interface AcquisitionSource {
  id: number;
  name: string;
  name_pt_br?: string;
  is_event: boolean;
  description: string;
}

/**
 * Modelo de Armadura
 */
export interface Armor {
  id: number;
  name: string;
  name_pt_br?: string;
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
  acquisition_source?: number;
  acquisition_source_detail?: AcquisitionSource;
  cost_currency: string;
}

/**
 * Modelo de Capacete
 */
export interface Helmet {
  id: number;
  name: string;
  name_pt_br?: string;
  image?: string;
  cost: number;
  source: 'store' | 'pass';
  source_display: string;
  pass_field?: number;
  pass_detail?: BattlePass;
  acquisition_source?: number;
  acquisition_source_detail?: AcquisitionSource;
  cost_currency: string;
}

/**
 * Modelo de Capa
 */
export interface Cape {
  id: number;
  name: string;
  name_pt_br?: string;
  image?: string;
  cost: number;
  source: 'store' | 'pass';
  source_display: string;
  pass_field?: number;
  pass_detail?: BattlePass;
  acquisition_source?: number;
  acquisition_source_detail?: AcquisitionSource;
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
  name_pt_br?: string;
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

/**
 * Modelo de Estratagema
 */
export interface Stratagem {
  id: number;
  name: string;
  name_pt_br?: string;
  department: string;
  department_display: string;
  icon?: string;
  codex: string;
  cooldown: number;
  cost: number;
  unlock_level: number;
  description: string;
  description_pt_br?: string;
  has_backpack?: boolean;
  is_tertiary_weapon?: boolean;
  is_mecha?: boolean;
  is_turret?: boolean;
  is_vehicle?: boolean;
  warbond?: number;
  warbond_detail?: BattlePass;
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

/**
 * Relação do usuário com stratagem
 */
export interface StratagemRelation {
  id: number;
  user: number;
  stratagem: number;
  relation_type: RelationType;
  created_at: string;
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

/**
 * Resposta paginada da API
 */
export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
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
