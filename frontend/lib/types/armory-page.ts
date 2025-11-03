/**
 * Types específicos para páginas do Armory
 * 
 * Tipos relacionados a filtros, opções de ordenação e estados de página
 * que são específicos para as páginas do sistema de armaduras.
 */

import type { ArmorSet, RelationType, SetRelationStatus } from './armory';

/**
 * Opções de ordenação disponíveis nas páginas do Armory
 */
export type OrderingOption =
  | 'name'
  | '-name'
  | 'cost'
  | '-cost'
  | 'armor'
  | '-armor'
  | 'speed'
  | '-speed'
  | 'stamina'
  | '-stamina';

/**
 * Opções de categoria de armadura
 */
export type CategoryOption = '' | 'light' | 'medium' | 'heavy';

/**
 * Opções de fonte de aquisição
 */
export type SourceOption = '' | 'store' | 'pass';

/**
 * Dados simplificados de passiva para o filtro
 */
export interface PassiveOption {
  id: number;
  name: string;
  name_pt_br?: string;
  effect: string;
  effect_pt_br?: string;
  image?: string;
}

/**
 * Estado de atualização de relações (evita múltiplos cliques)
 */
export type UpdatingState = Record<string, boolean>;

/**
 * Handler para toggle de relação
 */
export type HandleToggleRelation = (
  e: React.MouseEvent,
  set: ArmorSet,
  relationType: RelationType
) => Promise<void>;

