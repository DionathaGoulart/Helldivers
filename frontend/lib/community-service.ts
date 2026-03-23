import { supabase } from '@/lib/supabase';
import { PaginatedResponse, UserSet } from './types/armory';
import { getHelmets, getArmors, getCapes, getStratagems, getBoosters } from './armory-cached';
import { WeaponryService } from './weaponry-service';

// Formata e junta os IDs de estratagemas
const parseStratagems = (row: any) => {
    return [row.stratagem_1_id, row.stratagem_2_id, row.stratagem_3_id, row.stratagem_4_id].filter(id => id != null);
};

// Transforma o row do banco de dados em UserSet populando os dados locais
const enrichCommunitySet = async (row: any, userDetails: any): Promise<UserSet> => {
    const [helmets, armors, capes, stratagems, boosters, primaries, secondaries, throwables] = await Promise.all([
        getHelmets(), getArmors(), getCapes(), getStratagems(), getBoosters(),
        WeaponryService.getWeapons('primary'), WeaponryService.getWeapons('secondary'), WeaponryService.getWeapons('throwable')
    ]);

    const findItem = (list: any[], id: number) => list.find(i => i.id === id) || null;
    const strats = parseStratagems(row);

    return {
        id: row.id,
        name: row.name,
        description: row.description || '',
        helmet: row.helmet_id,
        helmet_detail: findItem(helmets, row.helmet_id),
        armor: row.armor_id,
        armor_detail: findItem(armors, row.armor_id),
        cape: row.cape_id,
        cape_detail: findItem(capes, row.cape_id),
        
        primary: row.primary_id,
        primary_detail: row.primary_id ? findItem(primaries, row.primary_id) : undefined,
        secondary: row.secondary_id,
        secondary_detail: row.secondary_id ? findItem(secondaries, row.secondary_id) : undefined,
        throwable: row.throwable_id,
        throwable_detail: row.throwable_id ? findItem(throwables, row.throwable_id) : undefined,
        booster: row.booster_id,
        booster_detail: row.booster_id ? findItem(boosters, row.booster_id) : undefined,
        
        stratagems: strats,
        stratagems_detail: strats.map(id => findItem(stratagems, id)).filter(Boolean),

        is_public: row.is_public,
        created_at: row.created_at,
        is_liked: userDetails?.liked_sets?.has(row.id) || false,
        like_count: Number(row.like_count || 0),
        is_favorited: userDetails?.favorite_sets?.has(row.id) || false,
        is_mine: userDetails?.user_id === row.user_id,
        creator_username: row.creator_username,
        user: row.user_id
    } as any;
};

export const CommunityService = {
    /**
     * Lista sets da comunidade ou do usuário
     */
    list: async (params?: { mode?: 'community' | 'mine' | 'favorites'; type?: 'loadout' | 'set'; page?: number; ordering?: string }): Promise<PaginatedResponse<UserSet>> => {
        const { data: { user } } = await supabase.auth.getUser();
        let query = supabase.from('community_sets_with_likes').select('*', { count: 'exact' });

        const PAGE_SIZE = 12;
        const page = params?.page || 1;
        const from = (page - 1) * PAGE_SIZE;
        const to = from + PAGE_SIZE - 1;

        const userDetails = {
            user_id: user?.id,
            liked_sets: new Set(),
            favorite_sets: new Set(),
        };

        // Identifica os favoritos primeiro se a aba for de "favoritos" para podermos filtrar a listagem
        if (user && params?.mode === 'favorites') {
            const { data: favs } = await supabase.from('user_relations')
                .select('item_id')
                .eq('user_id', user.id)
                .eq('relation_type', 'favorite')
                .eq('item_type', 'loadout');
                
            const favIds = favs?.map(f => f.item_id) || [];
            if (favIds.length === 0) return { count: 0, next: null, previous: null, results: [] };
            
            userDetails.favorite_sets = new Set(favIds);
            query = query.in('id', favIds);
        } else if (params?.mode === 'mine') {
            if (!user) return { count: 0, next: null, previous: null, results: [] };
            query = query.eq('user_id', user.id);
        } else {
            query = query.eq('is_public', true);
        }

        // Sort
        if (params?.ordering === 'popular') {
            query = query.order('like_count', { ascending: false });
        } else {
            query = query.order('created_at', { ascending: false });
        }

        // Parse pagination
        query = query.range(from, to);

        const { data, error, count } = await query;
        
        if (error) {
            console.error('Error fetching community sets:', error);
            return { count: 0, next: null, previous: null, results: [] };
        }

        // Otimização: Agora buscamos as curtidas (e favoritos caso não tenhamos) 
        // APENAS para os sets que retornaram nesta página (setIds)
        const setIds = data?.map(row => row.id) || [];
        
        if (user && setIds.length > 0) {
            const promises: any[] = [
                supabase.from('community_set_likes')
                    .select('set_id')
                    .eq('user_id', user.id)
                    .in('set_id', setIds)
            ];
            
            // Buscar relacionamentos caso não estejamos na aba de favoritos
            if (params?.mode !== 'favorites') {
                promises.push(
                    supabase.from('user_relations')
                        .select('item_id')
                        .eq('user_id', user.id)
                        .eq('relation_type', 'favorite')
                        .eq('item_type', 'loadout')
                        .in('item_id', setIds.map(String))
                );
            }
            
            const results = await Promise.all(promises);
            userDetails.liked_sets = new Set(results[0].data?.map((l: any) => l.set_id));
            
            if (params?.mode !== 'favorites' && results[1]) {
                 userDetails.favorite_sets = new Set(results[1].data?.map((f: any) => f.item_id));
            }
        }

        const enriched = await Promise.all((data || []).map(row => enrichCommunitySet(row, userDetails)));

        return {
            count: count || 0,
            next: (count && to + 1 < count) ? `?page=${page + 1}` : null,
            previous: page > 1 ? `?page=${page - 1}` : null,
            results: enriched,
        };
    },

    /**
     * Cria um novo set (loadout)
     */
    create: async (data: FormData): Promise<UserSet> => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('Não autenticado');

        const insertData = {
            user_id: user.id,
            creator_username: user.user_metadata?.username || user.email?.split('@')[0] || 'Unknown Diver',
            name: data.get('name'),
            description: data.get('description'),
            helmet_id: Number(data.get('helmet')),
            armor_id: Number(data.get('armor')),
            cape_id: Number(data.get('cape')),
            
            primary_id: data.get('primary') ? Number(data.get('primary')) : null,
            secondary_id: data.get('secondary') ? Number(data.get('secondary')) : null,
            throwable_id: data.get('throwable') ? Number(data.get('throwable')) : null,
            booster_id: data.get('booster') ? Number(data.get('booster')) : null,
            
        } as any;

        const strats = data.getAll('stratagems');
        if (strats[0]) insertData.stratagem_1_id = Number(strats[0]);
        if (strats[1]) insertData.stratagem_2_id = Number(strats[1]);
        if (strats[2]) insertData.stratagem_3_id = Number(strats[2]);
        if (strats[3]) insertData.stratagem_4_id = Number(strats[3]);

        const { data: newRow, error } = await supabase.from('community_sets').insert(insertData).select().single();
        if (error) throw error;
        
        // Enrich
        return await enrichCommunitySet(newRow, { user_id: user.id, liked_sets: new Set(), favorite_sets: new Set() });
    },

    /**
     * Toggle like em um set
     */
    toggleLike: async (id: string | number): Promise<{ liked: boolean; total_likes: number }> => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('Auth required');

        const { data, error: checkError } = await supabase.from('community_set_likes').select('set_id').match({ user_id: user.id, set_id: String(id) });
        const liked = data && data.length > 0;

        if (liked) {
            await supabase.from('community_set_likes').delete().match({ user_id: user.id, set_id: String(id) });
        } else {
            await supabase.from('community_set_likes').insert({ user_id: user.id, set_id: String(id) });
        }

        // Get total
        const { count } = await supabase.from('community_set_likes').select('*', { count: 'exact', head: true }).eq('set_id', String(id));
        
        return { liked: !liked, total_likes: count || 0 };
    },

    /**
     * Toggle favorite em um set
     * No backend original existia endpoint especifico, mas no supabase usamos user_relations com item_type='loadout'
     */
    toggleFavorite: async (id: string | number): Promise<{ favorited: boolean }> => {
        const { RelationService } = await import('./armory/relation-service');
        const status = await RelationService.checkStatus('loadout', id);
        await RelationService.toggleRelation('loadout', id, 'favorite', status.favorite);
        return { favorited: !status.favorite };
    },

    /**
     * Delete um set
     */
    delete: async (id: string | number): Promise<void> => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('Auth required');
        
        const { error } = await supabase.from('community_sets').delete().match({ id: String(id), user_id: user.id });
        if (error) throw error;
    }
};
