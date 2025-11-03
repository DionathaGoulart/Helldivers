/**
 * Utilitários relacionados ao Armory
 */

import type { ArmorSet } from '@/lib/types/armory';
import type { OrderingOption } from '@/lib/types/armory-page';

/**
 * Aplica ordenação customizada na lista de sets
 * @param list - Lista de sets a ser ordenada
 * @param ordering - Opção de ordenação
 * @returns Lista ordenada
 */
export function applyCustomOrdering(
  list: ArmorSet[],
  ordering: OrderingOption
): ArmorSet[] {
  const sortedList = [...list];

  if (ordering === 'cost' || ordering === '-cost') {
    sortedList.sort((a, b) => (a.total_cost || 0) - (b.total_cost || 0));
    if (ordering === '-cost') sortedList.reverse();
  } else if (ordering === 'armor' || ordering === '-armor') {
    sortedList.sort((a, b) => {
      const aArmor =
        typeof a.armor_stats?.armor === 'number' ? a.armor_stats.armor : 0;
      const bArmor =
        typeof b.armor_stats?.armor === 'number' ? b.armor_stats.armor : 0;
      return aArmor - bArmor;
    });
    if (ordering === '-armor') sortedList.reverse();
  } else if (ordering === 'speed' || ordering === '-speed') {
    sortedList.sort((a, b) => {
      const aSpeed =
        typeof a.armor_stats?.speed === 'number' ? a.armor_stats.speed : 0;
      const bSpeed =
        typeof b.armor_stats?.speed === 'number' ? b.armor_stats.speed : 0;
      return aSpeed - bSpeed;
    });
    if (ordering === '-speed') sortedList.reverse();
  } else if (ordering === 'stamina' || ordering === '-stamina') {
    sortedList.sort((a, b) => {
      const aStamina =
        typeof a.armor_stats?.stamina === 'number' ? a.armor_stats.stamina : 0;
      const bStamina =
        typeof b.armor_stats?.stamina === 'number' ? b.armor_stats.stamina : 0;
      return aStamina - bStamina;
    });
    if (ordering === '-stamina') sortedList.reverse();
  }

  return sortedList;
}

/**
 * Traduz categoria de armadura
 */
export function translateCategory(
  categoryDisplay: string | undefined,
  t: (key: string) => string
): string {
  if (!categoryDisplay) return '';
  const categoryLower = categoryDisplay.toLowerCase();
  if (categoryLower === 'leve' || categoryLower === 'light') {
    return t('armory.light');
  }
  if (categoryLower === 'médio' || categoryLower === 'medio' || categoryLower === 'medium') {
    return t('armory.medium');
  }
  if (categoryLower === 'pesado' || categoryLower === 'heavy') {
    return t('armory.heavy');
  }
  return categoryDisplay;
}

