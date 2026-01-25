import { cachedGet, api } from './api-cached';
import { invalidateCache, getCachedData } from './cache';

const PUBLIC_ENDPOINTS = [
    // Static Data
    '/api/v1/stratagems/',
    '/api/v1/boosters/',
    '/api/v1/warbonds/warbonds/',
    '/api/v1/armory/passives/',

    // Equipment (With default ordering used in pages)
    '/api/v1/armory/helmets/?ordering=name',
    '/api/v1/armory/armors/?ordering=name',
    '/api/v1/armory/capes/?ordering=name',
    '/api/v1/armory/sets/?ordering=name',

    // Weapons (With default ordering)
    '/api/v1/weaponry/primary/?ordering=name',
    '/api/v1/weaponry/secondary/?ordering=name',
    '/api/v1/weaponry/throwable/?ordering=name',
];

const USER_ENDPOINTS = [
    // User Lists - Sets
    '/api/v1/armory/user-sets/favorites/',
    '/api/v1/armory/user-sets/collection/',
    '/api/v1/armory/user-sets/wishlist/',

    // User Lists - Helmets
    '/api/v1/armory/user-helmets/favorites/',
    '/api/v1/armory/user-helmets/collection/',
    '/api/v1/armory/user-helmets/wishlist/',

    // User Lists - Armors
    '/api/v1/armory/user-armors/favorites/',
    '/api/v1/armory/user-armors/collection/',
    '/api/v1/armory/user-armors/wishlist/',

    // User Lists - Capes
    '/api/v1/armory/user-capes/favorites/',
    '/api/v1/armory/user-capes/collection/',
    '/api/v1/armory/user-capes/wishlist/',
];

/**
 * Busca recursivamente todas as páginas de um endpoint e cacheia cada uma.
 */
async function preloadRecursively(url: string): Promise<void> {
    try {
        // Busca a primeira página
        const response = await cachedGet<any>(url);
        const data = response.data;

        // Se for array simples, acabou
        if (Array.isArray(data)) {
            return;
        }

        // Se tiver paginação (next), continua buscando
        if (data && data.next) {
            let nextUrl = data.next;
            while (nextUrl) {
                // Importante: Ao usar cachedGet com a URL completa (nextUrl),
                // o sistema de cache vai normalizar e extrair params corretamente.
                const nextResponse = await cachedGet<any>(nextUrl);
                nextUrl = nextResponse.data.next;
            }
        }
    } catch (error) {
        // Ignora erros de rede para não travar o loader
        console.warn(`Failed to preload ${url}:`, error);
    }
}

/**
 * Verifica a versão global e decide se precisa precarregar dados.
 * @returns true se precisa mostrar loading, false se já está tudo pronto.
 */
export async function checkAndPreload(): Promise<boolean> {
    if (typeof window === 'undefined') return false;

    try {
        // 1. Verifica versão do servidor
        // Bypass cache para ter certeza
        let serverVersion = null;
        try {
            const versionResponse = await api.get<{ updated_at: string }>('/api/v1/version/', {
                skipCache: true
            } as any);
            serverVersion = versionResponse.data.updated_at;
        } catch (e) {
            console.error('Failed to check version:', e);
            const hasCache = !!getCachedData('/api/v1/stratagems/', undefined);
            return !hasCache;
        }

        const localVersion = localStorage.getItem('global_version_timestamp');

        // 2. Verifica se precisamos atualizar
        const needUpdate = serverVersion !== localVersion;

        // 3. Verifica se o cache está vazio (primeira visita)
        const hasCache = !!getCachedData('/api/v1/stratagems/', undefined);

        if (!needUpdate && hasCache) {
            console.log('Cache is up to date and valid. Skipping preload.');
            return false; // Instant load
        }

        // Se mudou versão, invalida tudo
        if (needUpdate) {
            console.log('New version detected. Clearing cache...', serverVersion);
            invalidateCache('*');
            if (serverVersion) {
                localStorage.setItem('global_version_timestamp', serverVersion);
            }
        } else if (!hasCache) {
            console.log('Cache missing. Starting preload...');
        }

        // 4. Inicia preload
        return true;

    } catch (error) {
        console.error('Failed to check preload status:', error);
        const hasCache = !!getCachedData('/api/v1/stratagems/', undefined);
        return !hasCache;
    }
}

/**
 * Verifica rádio e veloz se existe cache básico para permitir carregamento instantâneo.
 */
export function hasBasicCache(): boolean {
    if (typeof window === 'undefined') return false;
    // Verifica Stratagems e Sets como proxy de "cache existe"
    return !!getCachedData('/api/v1/stratagems/', undefined);
}

/**
 * Executa o preload de todos os endpoints usando um pool de requisições.
 * Mantém um número constante de requisições ativas para maximizar throughput.
 * @param isAuthenticated Se true, inclui endpoints do usuário.
 * @param onProgress Callback de progresso.
 */
export async function executePreload(isAuthenticated: boolean, onProgress?: (progress: number) => void): Promise<void> {
    const endpoints = isAuthenticated
        ? [...PUBLIC_ENDPOINTS, ...USER_ENDPOINTS]
        : [...PUBLIC_ENDPOINTS];

    // PRIORIZAÇÃO: Move endpoints críticos para o topo da lista
    // Queremos que a página de Sets carregue primeiro pq é a mais acessada
    const criticalEndpoints = [
        '/api/v1/armory/sets/?ordering=name',
        '/api/v1/armory/helmets/?ordering=name',
        '/api/v1/armory/armors/?ordering=name',
        '/api/v1/warbonds/warbonds/',
        '/api/v1/stratagems/'
    ];

    // Remove duplicates from general list to avoid double fetching
    const remainingEndpoints = endpoints.filter(e => !criticalEndpoints.includes(e));

    // Array final priorizado
    const prioritizedEndpoints = [...criticalEndpoints, ...remainingEndpoints];

    const total = prioritizedEndpoints.length;
    let completed = 0;

    // Aumentamos a concorrência para 8 (navegadores modernos OK com HTTP/2 ou conexões persistentes)
    // Um pool mantém 8 requisições ativas sempre, sem esperar "lotes" terminarem.
    const CONCURRENCY = 8;

    // Implementação simplificada de pool
    // 1. Cria array de workers
    const worker = async () => {
        while (prioritizedEndpoints.length > 0) {
            const url = prioritizedEndpoints.shift();
            if (url) {
                await preloadRecursively(url);
                completed++;
                if (onProgress) {
                    onProgress(Math.round((completed / total) * 100));
                }
            }
        }
    };

    // 2. Inicia N workers
    const workers = Array(Math.min(CONCURRENCY, total))
        .fill(null)
        .map(() => worker());

    // 3. Aguarda todos terminarem
    await Promise.all(workers);

    if (onProgress) onProgress(100);
}
