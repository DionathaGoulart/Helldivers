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
  const response = await cachedGet<Booster[] | { results: Booster[] }>(
    '/api/v1/boosters/',
    { checkForUpdates: true, ...config } as any
  );

  const data = response.data;
  return Array.isArray(data) ? data : data.results || [];
};

// ============================================================================
// FUNÇÕES DE API - ARMADURAS (COM CACHE)
// ============================================================================

/**
 * Busca todas as armaduras com filtros opcionais (com cache)
 */
export const getArmors = async (filters?: ArmorFilters, config?: any): Promise<Armor[]> => {
  const params = new URLSearchParams();

  if (filters) {
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, String(value));
      }
    });
  }

  const response = await cachedGet<Armor[] | { results: Armor[] }>(
    `/api/v1/armory/armors/?${params.toString()}`,
    { checkForUpdates: true, ...config } as any
  );

  const data = response.data;
  // Se tem results, é paginada - busca todas as páginas
  if (data && typeof data === 'object' && 'results' in data) {
    const paginatedData = data as PaginatedResponse<Armor>;
    const allResults: Armor[] = [...paginatedData.results];

    // Se há próxima página, busca recursivamente (com cache)
    if (paginatedData.next) {
      const nextResponse = await cachedGet<PaginatedResponse<Armor>>(
        paginatedData.next,
        { checkForUpdates: true } as any
      );
      allResults.push(...nextResponse.data.results);

      // Continua buscando se ainda há mais páginas
      let currentNext = nextResponse.data.next;
      while (currentNext) {
        const moreResponse = await cachedGet<PaginatedResponse<Armor>>(
          currentNext,
          { checkForUpdates: true } as any
        );
        allResults.push(...moreResponse.data.results);
        currentNext = moreResponse.data.next;
      }
    }

    return allResults;
  }

  return Array.isArray(data) ? data : [];
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
  const params = new URLSearchParams();

  if (filters) {
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, String(value));
      }
    });
  }

  const response = await cachedGet<Helmet[] | { results: Helmet[] }>(
    `/api/v1/armory/helmets/?${params.toString()}`,
    { checkForUpdates: true, ...config } as any
  );

  const data = response.data;
  // Se tem results, é paginada - busca todas as páginas
  if (data && typeof data === 'object' && 'results' in data) {
    const paginatedData = data as PaginatedResponse<Helmet>;
    const allResults: Helmet[] = [...paginatedData.results];

    // Se há próxima página, busca recursivamente (com cache)
    if (paginatedData.next) {
      const nextResponse = await cachedGet<PaginatedResponse<Helmet>>(
        paginatedData.next,
        { checkForUpdates: true } as any
      );
      allResults.push(...nextResponse.data.results);

      // Continua buscando se ainda há mais páginas
      let currentNext = nextResponse.data.next;
      while (currentNext) {
        const moreResponse = await cachedGet<PaginatedResponse<Helmet>>(
          currentNext,
          { checkForUpdates: true } as any
        );
        allResults.push(...moreResponse.data.results);
        currentNext = moreResponse.data.next;
      }
    }

    return allResults;
  }

  return Array.isArray(data) ? data : [];
};

// ============================================================================
// FUNÇÕES DE API - CAPAS (COM CACHE)
// ============================================================================

/**
 * Busca todas as capas com filtros opcionais (com cache)
 */
export const getCapes = async (filters?: ItemFilters, config?: any): Promise<Cape[]> => {
  const params = new URLSearchParams();

  if (filters) {
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, String(value));
      }
    });
  }

  const response = await cachedGet<Cape[] | { results: Cape[] }>(
    `/api/v1/armory/capes/?${params.toString()}`,
    { checkForUpdates: true, ...config } as any
  );

  const data = response.data;
  // Se tem results, é paginada - busca todas as páginas
  if (data && typeof data === 'object' && 'results' in data) {
    const paginatedData = data as PaginatedResponse<Cape>;
    const allResults: Cape[] = [...paginatedData.results];

    // Se há próxima página, busca recursivamente (com cache)
    if (paginatedData.next) {
      const nextResponse = await cachedGet<PaginatedResponse<Cape>>(
        paginatedData.next,
        { checkForUpdates: true } as any
      );
      allResults.push(...nextResponse.data.results);

      // Continua buscando se ainda há mais páginas
      let currentNext = nextResponse.data.next;
      while (currentNext) {
        const moreResponse = await cachedGet<PaginatedResponse<Cape>>(
          currentNext,
          { checkForUpdates: true } as any
        );
        allResults.push(...moreResponse.data.results);
        currentNext = moreResponse.data.next;
      }
    }

    return allResults;
  }

  return Array.isArray(data) ? data : [];
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
  const params = new URLSearchParams();

  if (filters) {
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, String(value));
      }
    });
  }

  const response = await cachedGet<ArmorSet[] | PaginatedResponse<ArmorSet>>(
    `/api/v1/armory/sets/?${params.toString()}`,
    { checkForUpdates: true, ...config } as any
  );

  const data = response.data;

  // Se é uma lista simples, retorna
  if (Array.isArray(data)) {
    return data;
  }

  // Se tem results, é paginada - busca todas as páginas
  if (data && typeof data === 'object' && 'results' in data) {
    const paginatedData = data as PaginatedResponse<ArmorSet>;
    const allResults: ArmorSet[] = [...paginatedData.results];

    // Se há próxima página, busca recursivamente (com cache)
    if (paginatedData.next) {
      const nextResponse = await cachedGet<PaginatedResponse<ArmorSet>>(
        paginatedData.next,
        { checkForUpdates: true } as any
      );
      allResults.push(...nextResponse.data.results);

      // Continua buscando se ainda há mais páginas
      let currentNext = nextResponse.data.next;
      while (currentNext) {
        const moreResponse = await cachedGet<PaginatedResponse<ArmorSet>>(
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
export const addSetRelation = async (
  armorSetId: number,
  relationType: RelationType
): Promise<void> => {
  await cachedPost('/api/v1/armory/user-sets/add/', {
    armor_set_id: armorSetId,
    relation_type: relationType,
  });

  // Busca o status atualizado diretamente do servidor (bypass cache)
  const { api, normalizeUrl, extractParams } = await import('./api-cached');
  const { setCachedData } = await import('./cache');
  const checkUrl = `/api/v1/armory/user-sets/check/?armor_set_id=${armorSetId}`;
  const response = await api.get<SetRelationStatus>(checkUrl);
  const updatedStatus = response.data;

  // Usa EXATAMENTE as mesmas funções que cachedGet usa para garantir chave idêntica
  const normalizedEndpoint = normalizeUrl(checkUrl);
  let params = extractParams(checkUrl);

  // Garante que armor_set_id seja sempre string (como vem da URL)
  // Isso é importante porque generateCacheKey compara valores estritamente
  if (params.armor_set_id !== undefined) {
    params = { ...params, armor_set_id: String(params.armor_set_id) };
  }

  // Atualiza o cache diretamente com os dados atualizados usando a mesma chave
  // IMPORTANTE: Salva o cache ANTES de qualquer outra operação para garantir
  // que seja encontrado imediatamente quando checkSetRelation for chamado
  setCachedData<SetRelationStatus>(normalizedEndpoint, updatedStatus, params, {
    ttl: Infinity, // Cache permanente para a sessão
  });

  // CRÍTICO: Atualiza também o cache das listagens completas (favorites/collection/wishlist)
  // Isso garante que após favoritar, as listas estejam atualizadas no cache
  // e serão encontradas corretamente após F5
  try {
    const listUrls = {
      favorite: '/api/v1/armory/user-sets/favorites/',
      collection: '/api/v1/armory/user-sets/collection/',
      wishlist: '/api/v1/armory/user-sets/wishlist/',
    };

    // Atualiza apenas a lista correspondente ao tipo de relação
    const urlToUpdate = listUrls[relationType];
    if (urlToUpdate) {
      // Bypass cache e busca do servidor para obter dados atualizados
      const { api } = await import('./api-cached');
      const { normalizeUrl } = await import('./api-cached');
      const { setCachedData } = await import('./cache');

      // Não aguarda o re-fetch da lista para não bloquear a UI
      api.get<ArmorSet[] | { results: ArmorSet[] }>(urlToUpdate).then(response => {
        const data = response.data;
        const setsList = Array.isArray(data) ? data : data.results || [];

        // Atualiza o cache da lista completa usando a mesma estrutura que cachedGet
        const normalizedListUrl = normalizeUrl(urlToUpdate);
        setCachedData<ArmorSet[]>(normalizedListUrl, setsList, {}, {
          ttl: Infinity, // Cache permanente para a sessão
          version: '1.0',
        });
      });
    }
  } catch (error) {
    // Se der erro ao atualizar as listas, não bloqueia a operação principal
    // O cache do check já foi atualizado, então o status individual está correto
  }
};

/**
 * Remove uma relação (favorito, coleção ou wishlist) de um set
 * Atualiza cache otimisticamente sem invalidar dados de sets
 */
export const removeSetRelation = async (
  armorSetId: number,
  relationType: RelationType
): Promise<void> => {
  await cachedPost('/api/v1/armory/user-sets/remove', { // Sem barra no final, proxy adiciona
    armor_set_id: armorSetId,
    relation_type: relationType,
  });

  // Busca o status atualizado diretamente do servidor (bypass cache)
  const { api, normalizeUrl, extractParams } = await import('./api-cached');
  const { setCachedData } = await import('./cache');
  const checkUrl = `/api/v1/armory/user-sets/check/?armor_set_id=${armorSetId}`;
  const response = await api.get<SetRelationStatus>(checkUrl);
  const updatedStatus = response.data;

  // Usa EXATAMENTE as mesmas funções que cachedGet usa para garantir chave idêntica
  const normalizedEndpoint = normalizeUrl(checkUrl);
  let params = extractParams(checkUrl);

  // Garante que armor_set_id seja sempre string (como vem da URL)
  // Isso é importante porque generateCacheKey compara valores estritamente
  if (params.armor_set_id !== undefined) {
    params = { ...params, armor_set_id: String(params.armor_set_id) };
  }

  // Atualiza o cache diretamente com os dados atualizados usando a mesma chave
  // IMPORTANTE: Salva o cache ANTES de qualquer outra operação para garantir
  // que seja encontrado imediatamente quando checkSetRelation for chamado
  setCachedData<SetRelationStatus>(normalizedEndpoint, updatedStatus, params, {
    ttl: Infinity, // Cache permanente para a sessão
  });

  // CRÍTICO: Atualiza também o cache das listagens completas (favorites/collection/wishlist)
  // Isso garante que após desfavoritar, as listas estejam atualizadas no cache
  // e serão encontradas corretamente após F5
  try {
    const listUrls = {
      favorite: '/api/v1/armory/user-sets/favorites/',
      collection: '/api/v1/armory/user-sets/collection/',
      wishlist: '/api/v1/armory/user-sets/wishlist/',
    };

    // Atualiza apenas a lista correspondente ao tipo de relação
    const urlToUpdate = listUrls[relationType];
    if (urlToUpdate) {
      // Bypass cache e busca do servidor para obter dados atualizados
      const { api } = await import('./api-cached');
      const { normalizeUrl } = await import('./api-cached');
      const { setCachedData } = await import('./cache');

      // Não aguarda o re-fetch da lista para não bloquear a UI
      api.get<ArmorSet[] | { results: ArmorSet[] }>(urlToUpdate).then(response => {
        const data = response.data;
        const setsList = Array.isArray(data) ? data : data.results || [];

        // Atualiza o cache da lista completa usando a mesma estrutura que cachedGet
        const normalizedListUrl = normalizeUrl(urlToUpdate);
        setCachedData<ArmorSet[]>(normalizedListUrl, setsList, {}, {
          ttl: Infinity, // Cache permanente para a sessão
          version: '1.0',
        });
      });
    }
  } catch (error) {
    // Se der erro ao atualizar as listas, não bloqueia a operação principal
    // O cache do check já foi atualizado, então o status individual está correto
  }
};

/**
 * Verifica o status de relações de um set (com cache)
 * Garante que o cache seja encontrado corretamente usando a mesma normalização
 * 
 * IMPORTANTE: Se o cache existir, NUNCA faz requisição ao servidor.
 * As requisições são feitas apenas na primeira vez por sessão.
 */
export const checkSetRelation = async (
  armorSetId: number,
  skipCache: boolean = false
): Promise<SetRelationStatus> => {
  const checkUrl = `/api/v1/armory/user-sets/check/?armor_set_id=${armorSetId}`;

  // Se skipCache for true, busca diretamente do servidor (bypass cache)
  if (skipCache) {
    const { api } = await import('./api-cached');
    const response = await api.get<SetRelationStatus>(checkUrl);
    return response.data;
  }

  // Tenta buscar do cache PRIMEIRO usando getCachedData diretamente
  // Isso é mais rápido que cachedGet porque não faz limpeza desnecessária
  const { normalizeUrl, extractParams } = await import('./api-cached');
  const { getCachedData } = await import('./cache');

  const normalizedEndpoint = normalizeUrl(checkUrl);
  const params = extractParams(checkUrl);

  // IMPORTANTE: Verifica o cache ANTES de qualquer coisa
  // Se encontrar cache válido, retorna imediatamente SEM fazer requisição
  const cachedData = getCachedData<SetRelationStatus>(normalizedEndpoint, params);

  if (cachedData !== null) {
    // Cache hit! Retorna imediatamente SEM fazer requisição
    return cachedData;
  }

  // Só faz requisição ao servidor se NÃO encontrar no cache
  // Isso deve acontecer apenas na primeira vez por sessão
  const response = await cachedGet<SetRelationStatus>(checkUrl);
  return response.data;
};

/**
 * Lista todos os sets favoritados pelo usuário (com cache)
 */
export const getFavoriteSets = async (): Promise<ArmorSet[]> => {
  const response = await cachedGet<ArmorSet[] | { results: ArmorSet[] }>(
    '/api/v1/armory/user-sets/favorites/'
  );

  const data = response.data;
  return Array.isArray(data) ? data : data.results || [];
};

/**
 * Lista todos os sets na coleção do usuário (com cache)
 */
export const getCollectionSets = async (config?: any): Promise<ArmorSet[]> => {
  const response = await cachedGet<ArmorSet[] | { results: ArmorSet[] }>(
    '/api/v1/armory/user-sets/collection/',
    { checkForUpdates: true, ...config } as any
  );

  const data = response.data;
  return Array.isArray(data) ? data : data.results || [];
};

/**
 * Lista todos os sets na wishlist do usuário (com cache)
 */
export const getWishlistSets = async (): Promise<ArmorSet[]> => {
  const response = await cachedGet<ArmorSet[] | { results: ArmorSet[] }>(
    '/api/v1/armory/user-sets/wishlist/'
  );

  const data = response.data;
  return Array.isArray(data) ? data : data.results || [];
};

// ============================================================================
// FUNÇÕES DE API - RELAÇÕES USUÁRIO-COMPONENTE (COM CACHE)
// ============================================================================

/**
 * Helper genérico para adicionar relação de componente
 */
const addComponentRelation = async (
  componentType: 'helmet' | 'armor' | 'cape',
  componentId: number,
  relationType: RelationType
): Promise<void> => {
  const endpoint = `/api/v1/armory/user-${componentType}s/add/`;
  const data = {
    [`${componentType}_id`]: componentId,
    relation_type: relationType,
  };

  await cachedPost(endpoint, data);

  // Atualiza cache local para verificação
  const checkUrl = `/api/v1/armory/user-${componentType}s/check/?${componentType}_id=${componentId}`;
  const { api, normalizeUrl, extractParams } = await import('./api-cached');
  const { setCachedData } = await import('./cache');

  const response = await api.get<SetRelationStatus>(checkUrl);
  const updatedStatus = response.data;

  const normalizedEndpoint = normalizeUrl(checkUrl);
  let params = extractParams(checkUrl);

  if (params[`${componentType}_id`] !== undefined) {
    params = { ...params, [`${componentType}_id`]: String(params[`${componentType}_id`]) };
  }

  setCachedData<SetRelationStatus>(normalizedEndpoint, updatedStatus, params, {
    ttl: Infinity,
  });
};

/**
 * Helper genérico para remover relação de componente
 */
const removeComponentRelation = async (
  componentType: 'helmet' | 'armor' | 'cape',
  componentId: number,
  relationType: RelationType
): Promise<void> => {
  const endpoint = `/api/v1/armory/user-${componentType}s/remove/`;
  const data = {
    [`${componentType}_id`]: componentId,
    relation_type: relationType,
  };

  await cachedDelete(endpoint, { data });

  // Atualiza cache local
  const checkUrl = `/api/v1/armory/user-${componentType}s/check/?${componentType}_id=${componentId}`;
  const { api, normalizeUrl, extractParams } = await import('./api-cached');
  const { setCachedData } = await import('./cache');

  const response = await api.get<SetRelationStatus>(checkUrl);
  const updatedStatus = response.data;

  const normalizedEndpoint = normalizeUrl(checkUrl);
  let params = extractParams(checkUrl);

  if (params[`${componentType}_id`] !== undefined) {
    params = { ...params, [`${componentType}_id`]: String(params[`${componentType}_id`]) };
  }

  setCachedData<SetRelationStatus>(normalizedEndpoint, updatedStatus, params, {
    ttl: Infinity,
  });
};

/**
 * Helper genérico para verificar relação de componente
 */
const checkComponentRelation = async (
  componentType: 'helmet' | 'armor' | 'cape',
  componentId: number,
  skipCache: boolean = false
): Promise<SetRelationStatus> => {
  const checkUrl = `/api/v1/armory/user-${componentType}s/check/?${componentType}_id=${componentId}`;

  if (skipCache) {
    const { api } = await import('./api-cached');
    const response = await api.get<SetRelationStatus>(checkUrl);
    return response.data;
  }

  const { normalizeUrl, extractParams } = await import('./api-cached');
  const { getCachedData } = await import('./cache');

  const normalizedEndpoint = normalizeUrl(checkUrl);
  const params = extractParams(checkUrl);

  const cachedData = getCachedData<SetRelationStatus>(normalizedEndpoint, params);

  if (cachedData !== null) {
    return cachedData;
  }

  const response = await cachedGet<SetRelationStatus>(checkUrl);
  return response.data;
};

// Exported functions per component type

export const addHelmetRelation = (id: number, type: RelationType) => addComponentRelation('helmet', id, type);
export const removeHelmetRelation = (id: number, type: RelationType) => removeComponentRelation('helmet', id, type);
export const checkHelmetRelation = (id: number, skipCache?: boolean) => checkComponentRelation('helmet', id, skipCache);

export const addArmorRelation = (id: number, type: RelationType) => addComponentRelation('armor', id, type);
export const removeArmorRelation = (id: number, type: RelationType) => removeComponentRelation('armor', id, type);
export const checkArmorRelation = (id: number, skipCache?: boolean) => checkComponentRelation('armor', id, skipCache);

export const addCapeRelation = (id: number, type: RelationType) => addComponentRelation('cape', id, type);
export const removeCapeRelation = (id: number, type: RelationType) => removeComponentRelation('cape', id, type);
export const checkCapeRelation = (id: number, skipCache?: boolean) => checkComponentRelation('cape', id, skipCache);


// ============================================================================
// FUNÇÕES DE API - ESTRATAGEMAS (COM CACHE)
// ============================================================================

/**
 * Busca todos os estratagemas com filtros opcionais (com cache)
 */
export const getStratagems = async (filters?: any, config?: any): Promise<Stratagem[]> => {
  const params = new URLSearchParams();

  if (filters) {
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, String(value));
      }
    });
  }

  const response = await cachedGet<Stratagem[] | { results: Stratagem[] }>(
    `/api/v1/stratagems/?${params.toString()}`,
    { checkForUpdates: true, ...config } as any
  );

  const data = response.data;
  return Array.isArray(data) ? data : data.results || [];
};


// ============================================================================
// FUNÇÕES DE API - RELAÇÕES USUÁRIO-STRATAGEM (COM CACHE)
// ============================================================================

export const addStratagemRelation = async (stratagemId: number, type: RelationType): Promise<void> => {
  await cachedPost('/api/v1/stratagems/user-stratagems/', {
    stratagem: stratagemId,
    relation_type: type
  });
};

export const removeStratagemRelation = async (stratagemId: number, type: RelationType): Promise<void> => {
  // O endpoint create faz toggle, então chamar novamente remove
  await cachedPost('/api/v1/stratagems/user-stratagems/', {
    stratagem: stratagemId,
    relation_type: type
  });
};

export const checkStratagemRelation = async (stratagemId: number): Promise<SetRelationStatus> => {
  // Como não temos endpoint de check específico ainda, vamos assumir default por enquanto
  // TODO: Implementar check endpoint no backend ou usar listas
  return { favorite: false, collection: false, wishlist: false };
};

export const getFavoriteStratagems = async (config?: any): Promise<Stratagem[]> => {
  const response = await cachedGet<Stratagem[]>(
    '/api/v1/stratagems/user-stratagems/by_type/?type=favorite',
    { checkForUpdates: true, ...config } as any
  );
  return response.data;
};

export const getCollectionStratagems = async (config?: any): Promise<Stratagem[]> => {
  const response = await cachedGet<Stratagem[]>(
    '/api/v1/stratagems/user-stratagems/by_type/?type=collection',
    { checkForUpdates: true, ...config } as any
  );
  return response.data;
};

export const getWishlistStratagems = async (config?: any): Promise<Stratagem[]> => {
  const response = await cachedGet<Stratagem[]>(
    '/api/v1/stratagems/user-stratagems/by_type/?type=wishlist',
    { checkForUpdates: true, ...config } as any
  );
  return response.data;
};

// ============================================================================
// FUNÇÕES DE API - LISTAGEM DE RELAÇÕES DE COMPONENTES (COM CACHE)
// ============================================================================

// Capacetes
export const getFavoriteHelmets = async (config?: any): Promise<Helmet[]> => {
  const response = await cachedGet<Helmet[]>(
    '/api/v1/armory/user-helmets/favorites/',
    { checkForUpdates: true, ...config } as any
  );
  return response.data;
};

export const getCollectionHelmets = async (config?: any): Promise<Helmet[]> => {
  const response = await cachedGet<Helmet[]>(
    '/api/v1/armory/user-helmets/collection/',
    { checkForUpdates: true, ...config } as any
  );
  return response.data;
};

export const getWishlistHelmets = async (config?: any): Promise<Helmet[]> => {
  const response = await cachedGet<Helmet[]>(
    '/api/v1/armory/user-helmets/wishlist/',
    { checkForUpdates: true, ...config } as any
  );
  return response.data;
};

// Armaduras
export const getFavoriteArmors = async (config?: any): Promise<Armor[]> => {
  const response = await cachedGet<Armor[]>(
    '/api/v1/armory/user-armors/favorites/',
    { checkForUpdates: true, ...config } as any
  );
  return response.data;
};

export const getCollectionArmors = async (config?: any): Promise<Armor[]> => {
  const response = await cachedGet<Armor[]>(
    '/api/v1/armory/user-armors/collection/',
    { checkForUpdates: true, ...config } as any
  );
  return response.data;
};

export const getWishlistArmors = async (config?: any): Promise<Armor[]> => {
  const response = await cachedGet<Armor[]>(
    '/api/v1/armory/user-armors/wishlist/',
    { checkForUpdates: true, ...config } as any
  );
  return response.data;
};

// Capas
export const getFavoriteCapes = async (config?: any): Promise<Cape[]> => {
  const response = await cachedGet<Cape[]>(
    '/api/v1/armory/user-capes/favorites/',
    { checkForUpdates: true, ...config } as any
  );
  return response.data;
};

export const getCollectionCapes = async (config?: any): Promise<Cape[]> => {
  const response = await cachedGet<Cape[]>(
    '/api/v1/armory/user-capes/collection/',
    { checkForUpdates: true, ...config } as any
  );
  return response.data;
};

export const getWishlistCapes = async (config?: any): Promise<Cape[]> => {
  const response = await cachedGet<Cape[]>(
    '/api/v1/armory/user-capes/wishlist/',
    { checkForUpdates: true, ...config } as any
  );
  return response.data;
};


// ============================================================================
// FUNÇÕES DE API - RELAÇÕES USUÁRIO-BOOSTER (COM CACHE)
// ============================================================================

export const addBoosterRelation = async (boosterId: number, type: RelationType): Promise<void> => {
  await cachedPost('/api/v1/boosters/user-boosters/', {
    booster: boosterId,
    relation_type: type
  });
};

export const removeBoosterRelation = async (boosterId: number, type: RelationType): Promise<void> => {
  // Toggle endpoint, same logic as stratagems
  await cachedPost('/api/v1/boosters/user-boosters/', {
    booster: boosterId,
    relation_type: type
  });
};

export const getFavoriteBoosters = async (config?: any): Promise<Booster[]> => {
  const response = await cachedGet<Booster[]>(
    '/api/v1/boosters/user-boosters/by_type/?type=favorite',
    { checkForUpdates: true, ...config } as any
  );
  return response.data;
};

export const getCollectionBoosters = async (config?: any): Promise<Booster[]> => {
  const response = await cachedGet<Booster[]>(
    '/api/v1/boosters/user-boosters/by_type/?type=collection',
    { checkForUpdates: true, ...config } as any
  );
  return response.data;
};

export const getWishlistBoosters = async (config?: any): Promise<Booster[]> => {
  const response = await cachedGet<Booster[]>(
    '/api/v1/boosters/user-boosters/by_type/?type=wishlist',
    { checkForUpdates: true, ...config } as any
  );
  return response.data;
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

