/**
 * Types específicos para a página de Armory (Sets)
 */

import type { ArmorSet, RelationType, SetRelationStatus } from '@/lib/types/armory';

/**
 * Opções de ordenação disponíveis na página
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

