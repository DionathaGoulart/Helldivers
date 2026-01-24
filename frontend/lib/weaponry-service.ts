import api from '@/lib/api';
import { WeaponCategory, AnyWeapon, WeaponRelationStatus } from './types/weaponry';

const BASE_URL = '/api/v1/weaponry';

export const WeaponryService = {
    async getWeapons(category: WeaponCategory): Promise<AnyWeapon[]> {
        const response = await api.get(`${BASE_URL}/${category}/`);
        return response.data;
    },

    async getUserItems(category: WeaponCategory, type: 'favorite' | 'collection' | 'wishlist'): Promise<AnyWeapon[]> {
        const response = await api.get(`${BASE_URL}/relations/${category}/by_type/?type=${type}`);
        return response.data;
    },

    async checkStatus(category: WeaponCategory, id: number): Promise<WeaponRelationStatus> {
        // Need to fetch relations. For now, assuming we might need a specific endpoint or fetch all relations.
        // Or we can use the 'by_type' endpoint from relations viewset?
        // Actually, efficiently checking one item status usually requires a specific endpoint or local cache.
        // For now, let's implement a way to get all relations for a user and map it, or a specific check endpoint.

        // Strategy: Get all relations for the category and check if the ID is there. 
        // This acts like a cache fill.

        // Ideally we should have an endpoint `relations/{category}/check/{id}` or return status with the item.
        // But following the pattern, let's try fetching all relations for the type first if not too expensive.
        // Or better, we can assume the caller handles bulk status, but here we provide a single check.
        // Let's implement check by trying to find it in the relations endpoints.

        try {
            const [fav, col, wish] = await Promise.all([
                api.get(`${BASE_URL}/relations/${category}/by_type/?type=favorite`),
                api.get(`${BASE_URL}/relations/${category}/by_type/?type=collection`),
                api.get(`${BASE_URL}/relations/${category}/by_type/?type=wishlist`)
            ]);

            // This return structure from 'by_type' returns a list of ITEMS.
            // So we check if our item is in the list.
            const isFav = fav.data.some((item: any) => item.id === id);
            const isCol = col.data.some((item: any) => item.id === id);
            const isWish = wish.data.some((item: any) => item.id === id);

            return { favorite: isFav, collection: isCol, wishlist: isWish };
        } catch (error) {
            console.error('Error checking weapon status', error);
            return { favorite: false, collection: false, wishlist: false };
        }
    },

    async toggleRelation(category: WeaponCategory, id: number, type: 'favorite' | 'collection' | 'wishlist', currentStatus: boolean, itemData?: AnyWeapon) {
        // If currentStatus is true, we want to REMOVE (toggle off).
        // If false, we want to ADD (toggle on).
        // The ViewSet create method handles toggle behavior based on existence.
        // So we just post to the create endpoint.

        await api.post(`${BASE_URL}/relations/${category}/`, {
            item: id,
            relation_type: type
        });
    }
};
