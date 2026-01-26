import { cachedGet, cachedPost } from '@/lib/api-cached';
import { WeaponCategory, AnyWeapon, WeaponRelationStatus } from './types/weaponry';

const BASE_URL = '/api/v1/weaponry';

// Helper to invalidate relation caches when toggling
const invalidateRelationCache = (category: WeaponCategory) => {
    // We invalidate the "by_type" endpoints for this category
    // This is simple but effective. Next time we check status, it will re-fetch (and thus cache) the new list.
    // If we want to be smarter, we'd manually update the cache, but since we don't have a single-item check endpoint,
    // re-fetching the list (which is small per user) is acceptable.
    // Actually, `api-cached` doesn't export `invalidateCache` associated with specific URL easily without regex.
    // We can rely on `checkForUpdates: true` in cachedGet which might handle it if we used it, 
    // but here we probably want to force update.
    // Let's import invalidateCache from cache.ts.
    import('@/lib/cache').then(({ invalidateCache }) => {
        invalidateCache(`${BASE_URL}/relations/${category}/by_type/`);
    });
};

export const WeaponryService = {
    async getWeapons(category: WeaponCategory): Promise<AnyWeapon[]> {
        const response = await cachedGet<AnyWeapon[]>(`${BASE_URL}/${category}/`, {
            checkForUpdates: true
        } as any);
        return response.data;
    },

    async getUserItems(category: WeaponCategory, type: 'favorite' | 'collection' | 'wishlist'): Promise<AnyWeapon[]> {
        const response = await cachedGet<AnyWeapon[]>(
            `${BASE_URL}/relations/${category}/by_type/?type=${type}`,
            { checkForUpdates: true } as any
        );
        return response.data;
    },

    async checkStatus(category: WeaponCategory, id: number): Promise<WeaponRelationStatus> {
        // Now efficiently checks using cached lists!
        try {
            const [fav, col, wish] = await Promise.all([
                WeaponryService.getUserItems(category, 'favorite'),
                WeaponryService.getUserItems(category, 'collection'),
                WeaponryService.getUserItems(category, 'wishlist')
            ]);

            const isFav = fav.some((item: any) => item.id === id);
            const isCol = col.some((item: any) => item.id === id);
            const isWish = wish.some((item: any) => item.id === id);

            return { favorite: isFav, collection: isCol, wishlist: isWish };
        } catch (error) {
            console.error('Error checking weapon status', error);
            return { favorite: false, collection: false, wishlist: false };
        }
    },

    async toggleRelation(category: WeaponCategory, id: number, type: 'favorite' | 'collection' | 'wishlist', currentStatus: boolean, itemData?: AnyWeapon) {
        await cachedPost(`${BASE_URL}/relations/${category}/`, {
            item: id,
            relation_type: type
        });

        // Invalidate cache so next checkStatus fetches fresh lists
        invalidateRelationCache(category);
    }
};
