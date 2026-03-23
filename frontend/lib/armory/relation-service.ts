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
    itemData?: any
  ): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const isAdding = !currentStatus;

    if (isAdding) {
      // Add the relation
      const { error } = await supabase.from('user_relations').insert({
        user_id: user.id,
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
          user_id: user.id, item_type: type, item_id: String(id), relation_type: 'wishlist'
        });
      }
      if (relationType === 'wishlist') {
        await supabase.from('user_relations').delete().match({
          user_id: user.id, item_type: type, item_id: String(id), relation_type: 'collection'
        });
      }
    } else {
      // Remove the relation
      const { error } = await supabase.from('user_relations').delete().match({
        user_id: user.id,
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

  async checkStatus(type: ComponentType, id: number | string): Promise<SetRelationStatus> {
    const defaultStatus = { favorite: false, collection: false, wishlist: false };
    
    // Fallback gracefully without throwing
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return defaultStatus;

    const { data, error } = await supabase.from('user_relations')
      .select('relation_type')
      .match({
        user_id: user.id,
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
  }
};

