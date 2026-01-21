import { api, normalizeUrl, extractParams } from '../api-cached';
import { setCachedData, getCachedData } from '../cache';
import type { RelationType, SetRelationStatus, ArmorSet, Helmet, Armor, Cape } from '../types/armory';

// API Endpoints mappings
const API_ENDPOINTS = {
    set: {
        add: '/api/v1/armory/user-sets/add/',
        remove: '/api/v1/armory/user-sets/remove', // No slash for POST action if using previous logic, ensuring consistency
        check: '/api/v1/armory/user-sets/check/',
        list: {
            favorite: '/api/v1/armory/user-sets/favorites/',
            collection: '/api/v1/armory/user-sets/collection/',
            wishlist: '/api/v1/armory/user-sets/wishlist/',
        }
    },
    helmet: {
        add: '/api/v1/armory/user-helmets/add/',
        remove: '/api/v1/armory/user-helmets/remove',
        check: '/api/v1/armory/user-helmets/check/',
        list: {
            favorite: '/api/v1/armory/user-helmets/favorites/',
            collection: '/api/v1/armory/user-helmets/collection/',
            wishlist: '/api/v1/armory/user-helmets/wishlist/',
        }
    },
    armor: {
        add: '/api/v1/armory/user-armors/add/',
        remove: '/api/v1/armory/user-armors/remove',
        check: '/api/v1/armory/user-armors/check/',
        list: {
            favorite: '/api/v1/armory/user-armors/favorites/',
            collection: '/api/v1/armory/user-armors/collection/',
            wishlist: '/api/v1/armory/user-armors/wishlist/',
        }
    },
    cape: {
        add: '/api/v1/armory/user-capes/add/',
        remove: '/api/v1/armory/user-capes/remove',
        check: '/api/v1/armory/user-capes/check/',
        list: {
            favorite: '/api/v1/armory/user-capes/favorites/',
            collection: '/api/v1/armory/user-capes/collection/',
            wishlist: '/api/v1/armory/user-capes/wishlist/',
        }
    }
};

type ComponentType = 'set' | 'helmet' | 'armor' | 'cape';

interface RelationItem {
    id: number;
    helmet?: any;
    armor?: any;
    cape?: any;
}

/**
 * Service to manage User Relations (Favorites, Collection, Wishlist)
 * Centralizes logic and ensures cache synchronization.
 */
export const RelationService = {

    /**
     * Toggle a relation for an item.
     * Handles optimistic updates for deep synchronization (Set <-> Components).
     */
    async toggleRelation(
        type: ComponentType,
        id: number,
        relationType: RelationType,
        currentStatus: boolean,
        itemData?: RelationItem // Optional full item data for smart sync
    ): Promise<void> {
        const isAdding = !currentStatus;

        // 1. Determine params
        const idParamKey = type === 'set' ? 'armor_set_id' : `${type}_id`;
        const endpoints = API_ENDPOINTS[type];

        // 2. Perform API call (Fire and Forget logic for UI speed, but await for correctness in this function?)
        // To be "instant", we shouldn't await heavily. But we need to send the request.
        const url = isAdding ? endpoints.add : endpoints.remove;
        const body = { [idParamKey]: id, relation_type: relationType };

        // Send request
        api.post(url, body).catch(console.error); // Background

        // 3. Optimistic Cache Update (Immediate)
        await this.updateLocalCache(type, id, relationType, isAdding);

        // 4. Smart Deep Sync (Set <-> Components) - Optimistic
        if (type === 'set' && itemData) {
            // If toggling a Set, also toggle its components in cache
            this.syncComponentsFromSet(itemData, relationType, isAdding);
        }
        else if (type !== 'set') {
            // If toggling a component, we might affect a Set
            // This is harder to do purely optimistically without knowing which Set it belongs to.
            // But invalidating the Set lists is a good safe bet.
            // Or if we have set_ids (rarely available on component directly in list view).
        }

        // 5. Background List Refresh (Non-blocking)
        this.refreshListsBackground(type, relationType);
        if (type === 'set') {
            // Also refresh component lists
            this.refreshListsBackground('helmet', relationType);
            this.refreshListsBackground('armor', relationType);
            this.refreshListsBackground('cape', relationType);
        } else {
            // Also refresh set list
            this.refreshListsBackground('set', relationType);
        }
    },

    /**
     * Updates the localized check cache (check_relation)
     */
    async updateLocalCache(type: ComponentType, id: number, relationType: RelationType, value: boolean) {
        const endpoints = API_ENDPOINTS[type];
        const checkUrl = `${endpoints.check}?${type === 'set' ? 'armor_set_id' : `${type}_id`}=${id}`;

        const normalizedUrl = normalizeUrl(checkUrl);
        const params = extractParams(checkUrl);

        // Get current cache or default
        let currentStatus = getCachedData<SetRelationStatus>(normalizedUrl, params) || {
            favorite: false, collection: false, wishlist: false
        };

        // Update specific field
        currentStatus = { ...currentStatus, [relationType]: value };

        // Handle mutual exclusion (Collection vs Wishlist)
        if (relationType === 'collection' && value) currentStatus.wishlist = false;
        if (relationType === 'wishlist' && value) currentStatus.collection = false;

        setCachedData(normalizedUrl, currentStatus, params, { ttl: Infinity });
    },

    /**
     * Optimistically updates components cache when a Set is toggled.
     */
    async syncComponentsFromSet(set: RelationItem, relationType: RelationType, isAdding: boolean) {
        if (isAdding) {
            // Adding Set -> Add all components
            if (set.helmet) this.updateLocalCache('helmet', set.helmet.id, relationType, true);
            if (set.armor) this.updateLocalCache('armor', set.armor.id, relationType, true);
            if (set.cape) this.updateLocalCache('cape', set.cape.id, relationType, true);
        } else {
            // Removing Set -> Remove all components
            if (set.helmet) this.updateLocalCache('helmet', set.helmet.id, relationType, false);
            if (set.armor) this.updateLocalCache('armor', set.armor.id, relationType, false);
            if (set.cape) this.updateLocalCache('cape', set.cape.id, relationType, false);
        }
    },

    /**
     * Triggers a background fetch to update the full lists cache.
     */
    refreshListsBackground(type: ComponentType, relationType: RelationType) {
        const endpoints = API_ENDPOINTS[type];
        const itemsUrl = endpoints.list[relationType]; // e.g. /favorites/

        if (!itemsUrl) return;

        api.get(itemsUrl).then(response => {
            const data = response.data;
            const list = Array.isArray(data) ? data : (data as any).results || [];

            const normalizedUrl = normalizeUrl(itemsUrl);
            setCachedData(normalizedUrl, list, {}, { ttl: Infinity });
        }).catch(() => { }); // Silent fail
    },

    /**
     * Check status (with cache preference)
     */
    async checkStatus(type: ComponentType, id: number): Promise<SetRelationStatus> {
        const endpoints = API_ENDPOINTS[type];
        const paramKey = type === 'set' ? 'armor_set_id' : `${type}_id`;
        const checkUrl = `${endpoints.check}?${paramKey}=${id}`;

        const normalizedUrl = normalizeUrl(checkUrl);
        const params = extractParams(checkUrl);

        const cached = getCachedData<SetRelationStatus>(normalizedUrl, params);
        if (cached) return cached;

        // Fetch if missing
        try {
            const response = await api.get<SetRelationStatus>(checkUrl);
            const data = response.data;
            setCachedData(normalizedUrl, data, params, { ttl: Infinity });
            return data;
        } catch (e) {
            return { favorite: false, collection: false, wishlist: false };
        }
    }
};
