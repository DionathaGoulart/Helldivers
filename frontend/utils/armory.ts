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
export function applyCustomOrdering<T extends Record<string, any>>(
  list: T[],
  ordering: OrderingOption
): T[] {
  const sortedList = [...list];

  if (ordering === 'cost' || ordering === '-cost') {
    sortedList.sort((a, b) => {
      const aCost = a.total_cost !== undefined ? a.total_cost : (a.cost || 0);
      const bCost = b.total_cost !== undefined ? b.total_cost : (b.cost || 0);
      return aCost - bCost;
    });
    if (ordering === '-cost') sortedList.reverse();
  } else if (ordering === 'armor' || ordering === '-armor') {
    sortedList.sort((a, b) => {
      const aArmor = a.armor_stats?.armor !== undefined ? a.armor_stats.armor : (a.armor || 0);
      const bArmor = b.armor_stats?.armor !== undefined ? b.armor_stats.armor : (b.armor || 0);
      
      const numA = typeof aArmor === 'number' ? aArmor : 0;
      const numB = typeof bArmor === 'number' ? bArmor : 0;
      return numA - numB;
    });
    if (ordering === '-armor') sortedList.reverse();
  } else if (ordering === 'speed' || ordering === '-speed') {
    sortedList.sort((a, b) => {
      const aSpeed = a.armor_stats?.speed !== undefined ? a.armor_stats.speed : (a.speed || 0);
      const bSpeed = b.armor_stats?.speed !== undefined ? b.armor_stats.speed : (b.speed || 0);
      
      const numA = typeof aSpeed === 'number' ? aSpeed : 0;
      const numB = typeof bSpeed === 'number' ? bSpeed : 0;
      return numA - numB;
    });
    if (ordering === '-speed') sortedList.reverse();
  } else if (ordering === 'stamina' || ordering === '-stamina') {
    sortedList.sort((a, b) => {
      const aStamina = a.armor_stats?.stamina !== undefined ? a.armor_stats.stamina : (a.stamina || 0);
      const bStamina = b.armor_stats?.stamina !== undefined ? b.armor_stats.stamina : (b.stamina || 0);
      
      const numA = typeof aStamina === 'number' ? aStamina : 0;
      const numB = typeof bStamina === 'number' ? bStamina : 0;
      return numA - numB;
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

