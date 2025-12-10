/**
 * Utilitários para armazenar e recuperar filtros do sessionStorage
 * 
 * Permite que os filtros sejam mantidos ao navegar entre páginas
 */

// Chaves do sessionStorage para cada página
const STORAGE_KEYS = {
  armorySets: 'helldivers_armory_sets_filters',
  armors: 'helldivers_armors_filters',
  capes: 'helldivers_capes_filters',
  helmets: 'helldivers_helmets_filters',
} as const;

type StorageKey = keyof typeof STORAGE_KEYS;

/**
 * Salva filtros no sessionStorage
 */
export function saveFiltersToStorage<T extends Record<string, any>>(
  page: StorageKey,
  filters: T
): void {
  if (typeof window === 'undefined') return;
  
  try {
    const key = STORAGE_KEYS[page];
    sessionStorage.setItem(key, JSON.stringify(filters));
  } catch (error) {
    // Se der erro (ex: storage cheio), apenas ignora
    console.warn('Erro ao salvar filtros no sessionStorage:', error);
  }
}

/**
 * Recupera filtros do sessionStorage
 */
export function getFiltersFromStorage<T extends Record<string, any>>(
  page: StorageKey,
  defaultFilters: T
): T {
  if (typeof window === 'undefined') return defaultFilters;
  
  try {
    const key = STORAGE_KEYS[page];
    const stored = sessionStorage.getItem(key);
    
    if (!stored) return defaultFilters;
    
    const parsed = JSON.parse(stored);
    // Mescla com os filtros padrão para garantir que todos os campos existam
    return { ...defaultFilters, ...parsed };
  } catch (error) {
    // Se der erro ao parsear, retorna os filtros padrão
    console.warn('Erro ao recuperar filtros do sessionStorage:', error);
    return defaultFilters;
  }
}

/**
 * Limpa filtros do sessionStorage
 */
export function clearFiltersFromStorage(page: StorageKey): void {
  if (typeof window === 'undefined') return;
  
  try {
    const key = STORAGE_KEYS[page];
    sessionStorage.removeItem(key);
  } catch (error) {
    console.warn('Erro ao limpar filtros do sessionStorage:', error);
  }
}

