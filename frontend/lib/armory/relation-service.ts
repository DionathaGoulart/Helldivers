import { supabase } from '@/lib/supabase';
import type { RelationType, SetRelationStatus } from '../types/armory';

type ComponentType = 'set' | 'helmet' | 'armor' | 'cape' | 'stratagem' | 'booster' | 'primary_weapon' | 'secondary_weapon' | 'throwable_weapon' | string;

/**
 * Service to manage User Relations (Favorites, Collection, Wishlist)
 * Centralizes logic and interacts with Supabase exclusively
 */
export const RelationService = {
  async toggleRelation(
    type: ComponentType,
    id: number | string,
    relationType: RelationType,
    currentStatus: boolean,
    itemData?: any,
    userId?: string
  ): Promise<void> {
    let activeUserId = userId;
    
    if (!activeUserId) {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('User not authenticated');
        activeUserId = user.id;
    }

    const isAdding = !currentStatus;

    if (isAdding) {
      // Add the relation
      const { error } = await supabase.from('user_relations').insert({
        user_id: activeUserId,
        item_type: type,
        item_id: String(id), // item_id no supabase é varchar/text
        relation_type: relationType
      });

      if (error) {
        console.error('Error adding relation:', error);
        throw error;
      }

      // Handle mutual exclusion
      if (relationType === 'collection') {
        await supabase.from('user_relations').delete().match({
          user_id: activeUserId, item_type: type, item_id: String(id), relation_type: 'wishlist'
        });
      }
      if (relationType === 'wishlist') {
        await supabase.from('user_relations').delete().match({
          user_id: activeUserId, item_type: type, item_id: String(id), relation_type: 'collection'
        });
      }
    } else {
      // Remove the relation
      const { error } = await supabase.from('user_relations').delete().match({
        user_id: activeUserId,
        item_type: type,
        item_id: String(id),
        relation_type: relationType
      });

      if (error) {
        console.error('Error removing relation:', error);
        throw error;
      }
    }
  },

  async checkStatus(type: ComponentType, id: number | string, userId?: string): Promise<SetRelationStatus> {
    const defaultStatus = { favorite: false, collection: false, wishlist: false };
    
    let activeUserId = userId;
    if (!activeUserId) {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return defaultStatus;
        activeUserId = user.id;
    }

    const { data, error } = await supabase.from('user_relations')
      .select('relation_type')
      .match({
        user_id: activeUserId,
        item_type: type,
        item_id: String(id)
      });

    if (error) {
      console.error('Error checking relation status:', error);
      return defaultStatus;
    }

    const status = { ...defaultStatus };
    if (data && data.length > 0) {
      data.forEach((row: any) => {
        status[row.relation_type as RelationType] = true;
      });
    }

    return status;
  },

  /**
   * Checks status for multiple items of the same type at once
   */
  async checkBulkStatus(type: ComponentType, ids: (number | string)[], userId?: string): Promise<Record<string, SetRelationStatus>> {
    const results: Record<string, SetRelationStatus> = {};
    ids.forEach(id => {
      results[String(id)] = { favorite: false, collection: false, wishlist: false };
    });

    let activeUserId = userId;
    if (!activeUserId) {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return results;
        activeUserId = user.id;
    }

    const stringIds = ids.map(id => String(id));

    const { data, error } = await supabase.from('user_relations')
      .select('item_id, relation_type')
      .eq('user_id', activeUserId)
      .eq('item_type', type)
      .in('item_id', stringIds);

    if (error) {
      console.error('Error checking bulk relation status:', error);
      return results;
    }

    if (data) {
      data.forEach((row: any) => {
        const itemId = row.item_id;
        const relType = row.relation_type as RelationType;
        if (results[itemId]) {
          results[itemId][relType] = true;
        }
      });
    }

    return results;
  }
};

