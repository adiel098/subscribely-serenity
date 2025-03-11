
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { createLogger } from '../../../services/loggingService.ts';

/**
 * Find a group by its ID
 */
export async function findGroupById(supabase: ReturnType<typeof createClient>, groupId: string) {
  const logger = createLogger(supabase, 'GROUP-DB-UTILS');
  
  try {
    await logger.info(`🔍 Looking up group by ID: ${groupId}`);
    
    const { data: group, error: groupError } = await supabase
      .from('community_groups')
      .select(`
        id,
        name,
        telegram_chat_id,
        telegram_invite_link
      `)
      .eq('id', groupId)
      .single();

    if (groupError || !group) {
      await logger.error(`❌ Group not found: ${groupError?.message || 'Unknown error'}`);
      return { success: false, error: groupError };
    }

    await logger.success(`✅ Found group: ${group.name}`);
    return { success: true, data: group };
  } catch (error) {
    await logger.error(`❌ Error in findGroupById for ID: ${groupId}`, error);
    throw error;
  }
}

/**
 * Find all communities associated with a group
 */
export async function findGroupCommunities(supabase: ReturnType<typeof createClient>, groupId: string) {
  const logger = createLogger(supabase, 'GROUP-DB-UTILS');
  
  try {
    await logger.info(`🔍 Looking up communities for group ID: ${groupId}`);
    
    const { data: groupMembers, error: membersError } = await supabase
      .from('community_group_members')
      .select(`
        community_id,
        communities:community_id (
          id,
          name
        )
      `)
      .eq('group_id', groupId);

    if (membersError) {
      await logger.error(`❌ Error fetching group members: ${membersError.message}`);
      return { success: false, error: membersError };
    }

    const communityIds = groupMembers?.map(member => member.community_id) || [];
    const communityNames = groupMembers
      ?.map(member => member.communities?.name)
      .filter(Boolean)
      .join(', ');

    await logger.success(`✅ Found ${communityIds.length} communities for group ${groupId}`);
    
    return { 
      success: true, 
      communityIds,
      communityNames
    };
  } catch (error) {
    await logger.error(`❌ Error in findGroupCommunities for group ID: ${groupId}`, error);
    throw error;
  }
}

/**
 * Check if a group has at least one active subscription plan and one active payment method
 */
export async function checkGroupRequirements(
  supabase: ReturnType<typeof createClient>,
  groupId: string
): Promise<{ hasActivePlan: boolean, hasActivePaymentMethod: boolean }> {
  const logger = createLogger(supabase, 'GROUP-DB-UTILS');
  
  try {
    await logger.info(`🔍 Checking group requirements for group ${groupId}`);
    
    const { data: groupMembers } = await supabase
      .from('community_group_members')
      .select('community_id')
      .eq('group_id', groupId);
    
    if (!groupMembers || groupMembers.length === 0) {
      await logger.warn(`⚠️ No communities found for group ${groupId}`);
      return { hasActivePlan: false, hasActivePaymentMethod: false };
    }
    
    const communityIds = groupMembers.map(member => member.community_id);
    
    const { count: planCount } = await supabase
      .from('subscription_plans')
      .select('id', { count: 'exact', head: true })
      .in('community_id', communityIds)
      .eq('is_active', true)
      .limit(1);
      
    const { count: paymentMethodCount } = await supabase
      .from('payment_methods')
      .select('id', { count: 'exact', head: true })
      .in('community_id', communityIds)
      .eq('is_active', true)
      .limit(1);
    
    const hasActivePlan = (planCount || 0) > 0;
    const hasActivePaymentMethod = (paymentMethodCount || 0) > 0;
    
    await logger.info(`✅ Group ${groupId} requirements check: Active Plans: ${hasActivePlan ? 'YES' : 'NO'}, Active Payment Methods: ${hasActivePaymentMethod ? 'YES' : 'NO'}`);
    
    return { hasActivePlan, hasActivePaymentMethod };
  } catch (error) {
    await logger.error(`❌ Error checking group requirements: ${error.message}`, error);
    return { hasActivePlan: false, hasActivePaymentMethod: false };
  }
}
