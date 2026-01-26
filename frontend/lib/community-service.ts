import api from './api';
import { PaginatedResponse, UserSet, UserSetFilters } from './types/armory';

export const CommunityService = {
    /**
     * Lista sets da comunidade ou do usuário
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
        if (params?.ordering) queryParams.append('ordering', params.ordering);

        const response = await api.get(`/api/v1/armory/community-sets/?${queryParams.toString()}`);
        return response.data;
    },

    /**
     * Cria um novo set
     */
    create: async (data: FormData): Promise<UserSet> => {
        const response = await api.post('/api/v1/armory/community-sets/', data, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    },

    /**
     * Toggle like em um set
     */
    toggleLike: async (id: number): Promise<{ liked: boolean; total_likes: number }> => {
        const response = await api.post(`/api/v1/armory/community-sets/${id}/like/`);
        return response.data;
    },

    /**
     * Toggle favorite em um set
     */
    toggleFavorite: async (id: number): Promise<{ favorited: boolean }> => {
        const response = await api.post(`/api/v1/armory/community-sets/${id}/favorite/`);
        return response.data;
    },

    /**
     * Delete um set
     */
    delete: async (id: number): Promise<void> => {
        await api.delete(`/api/v1/armory/community-sets/${id}/`);
    }
};
