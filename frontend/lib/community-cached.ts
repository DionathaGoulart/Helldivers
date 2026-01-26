import { cachedGet, cachedPost, cachedDelete } from './api-cached';
import { api } from './api-cached';
import { invalidateCache } from './cache';
import { UserSet } from './types/armory';

export const CommunityCachedService = {
    /**
     * Lista sets da comunidade ou do usuário (com cache)
     */
    list: async (params?: { mode?: 'community' | 'mine' | 'favorites'; type?: 'loadout' | 'set'; page?: number; ordering?: string }): Promise<{
        count: number;
        next: string | null;
        previous: string | null;
        results: UserSet[];
    }> => {
        const queryParams = new URLSearchParams();
        if (params?.mode) queryParams.append('mode', params.mode);
        if (params?.type) queryParams.append('type', params.type);
        if (params?.page) queryParams.append('page', params.page.toString());
        // Default ordering to match preload
        if (params?.ordering) {
            queryParams.append('ordering', params.ordering);
        } else {
            // If no ordering provided, we might default to 'smart' in logic but explicit is better for cache key matching
            // Ideally frontend always passes ordering.
        }

        const response = await cachedGet<{
            count: number;
            next: string | null;
            previous: string | null;
            results: UserSet[];
        }>(`/api/v1/armory/community-sets/?${queryParams.toString()}`, { checkForUpdates: true } as any);

        return response.data;
    },

    /**
     * Cria um novo set (bypass cache mas pode invalidar)
     */
    create: async (data: FormData): Promise<UserSet> => {
        const response = await api.post('/api/v1/armory/community-sets/', data, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        // Invalidate lists to show new item
        await invalidateCache('/api/v1/armory/community-sets/');
        return response.data;
    },

    /**
     * Toggle like em um set
     */
    toggleLike: async (id: number): Promise<{ liked: boolean; total_likes: number }> => {
        const response = await api.post(`/api/v1/armory/community-sets/${id}/like/`);
        // Invalidate to update like counts in lists
        await invalidateCache('/api/v1/armory/community-sets/');
        return response.data;
    },

    /**
     * Toggle favorite em um set (Agora "Salvar")
     */
    toggleFavorite: async (id: number): Promise<{ favorited: boolean }> => {
        const response = await api.post(`/api/v1/armory/community-sets/${id}/favorite/`);
        // Invalidate "saved" lists (and others where star might appear)
        await invalidateCache('/api/v1/armory/community-sets/');
        return response.data;
    },

    /**
     * Delete um set
     */
    delete: async (id: number): Promise<void> => {
        await api.delete(`/api/v1/armory/community-sets/${id}/`);
        // Invalidate lists to remove item
        await invalidateCache('/api/v1/armory/community-sets/');
    }
};
