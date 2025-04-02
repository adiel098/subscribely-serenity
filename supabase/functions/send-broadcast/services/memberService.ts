
import { MembersResult, Member } from '../types/types.ts';
import { createLogger } from '../../_shared/logger.ts';

const logger = createLogger('member-service');

export async function getMembersToNotify(
  supabase: any,
  entityId: string,
  entityType: 'community' | 'group',
  filterType: string,
  planId?: string | null
): Promise<MembersResult> {
  try {
    logger.log(`Getting members for ${entityType} ${entityId} with filter ${filterType}`);
    
    // Default to using community_id
    let idField = 'community_id';
    
    // Base query
    let query = supabase
      .from('community_subscribers')
      .select('telegram_user_id, subscription_status, is_active, telegram_username');
    
    // Apply filter based on entityType
    if (entityType === 'community') {
      query = query.eq('community_id', entityId);
    } else if (entityType === 'group') {
      // For groups, we need to find the parent community
      const { data: groupData, error: groupError } = await supabase
        .from('communities')
        .select('id')
        .eq('id', entityId)
        .single();
        
      if (groupError || !groupData) {
        logger.error(`Error fetching group data: ${groupError?.message || 'Group not found'}`);
        return { error: `Group not found: ${groupError?.message || 'Unknown error'}` };
      }
      
      query = query.eq('community_id', groupData.id);
    } else {
      return { error: `Invalid entity type: ${entityType}` };
    }
    
    // Apply status filter
    if (filterType === 'active') {
      query = query.eq('is_active', true);
    } else if (filterType === 'expired') {
      query = query.eq('subscription_status', 'expired');
    } else if (filterType === 'plan' && planId) {
      query = query.eq('subscription_plan_id', planId);
    }
    
    // Execute query to get members first
    const { data: members, error } = await query;
    
    if (error) {
      logger.error(`Error fetching members: ${error.message}`);
      return { error: `Error fetching members: ${error.message}` };
    }
    
    // Get total count - using the length of the returned members array 
    // instead of a separate count query which was causing the error
    const totalCount = members?.length || 0;
    
    logger.log(`Found ${totalCount} members`);
    return { members: members as Member[], totalCount };
  } catch (error) {
    logger.error(`Exception in getMembersToNotify: ${error.message}`);
    return { error: `Exception: ${error.message}` };
  }
}
