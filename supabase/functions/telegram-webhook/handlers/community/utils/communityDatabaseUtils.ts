
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { createLogger } from '../../../services/loggingService.ts';

/**
 * Find a community by its ID or custom link
 */
export async function findCommunityById(supabase: ReturnType<typeof createClient>, communityIdOrLink: string) {
  const logger = createLogger(supabase, 'COMMUNITY-DB-UTILS');
  
  try {
    await logger.info(`🔍 Looking up community by ID or link: ${communityIdOrLink}`);
    
    // Check if it's a UUID or custom link
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(communityIdOrLink);
    
    let query;
    if (isUUID) {
      await logger.info(`🆔 Input appears to be a UUID: ${communityIdOrLink}`);
      // Search by ID
      query = supabase
        .from('communities')
        .select('id, name, telegram_chat_id, custom_link')
        .eq('id', communityIdOrLink);
    } else {
      await logger.info(`🔗 Input appears to be a custom link: ${communityIdOrLink}`);
      // Search by custom link
      query = supabase
        .from('communities')
        .select('id, name, telegram_chat_id, custom_link')
        .eq('custom_link', communityIdOrLink);
    }
    
    const { data: communities, error: searchError } = await query;
    
    if (searchError) {
      await logger.error(`❌ Error searching for community: ${searchError.message}`);
      return { success: false, error: searchError };
    }
    
    if (!communities || communities.length === 0) {
      await logger.error(`❌ No community found with identifier: ${communityIdOrLink}`);
      return { success: false, error: { message: 'Community not found' } };
    }
    
    // Get the first matching community
    const community = communities[0];
    
    await logger.success(`✅ Found community: ${community.name} (ID: ${community.id})`);
    return { success: true, data: community };
  } catch (error) {
    await logger.error(`❌ Error in findCommunityById for ID or link: ${communityIdOrLink}`, error);
    return { success: false, error };
  }
}

/**
 * Check if a community has at least one active subscription plan and one active payment method
 */
export async function checkCommunityRequirements(
  supabase: ReturnType<typeof createClient>,
  communityId: string
): Promise<{ hasActivePlan: boolean, hasActivePaymentMethod: boolean }> {
  const logger = createLogger(supabase, 'COMMUNITY-DB-UTILS');
  
  try {
    await logger.info(`🔍 Checking community requirements for community ${communityId}`);
    
    // Check for active subscription plans
    const { count: planCount, error: planError } = await supabase
      .from('subscription_plans')
      .select('id', { count: 'exact', head: true })
      .eq('community_id', communityId)
      .eq('is_active', true)
      .limit(1);
    
    if (planError) {
      await logger.error(`❌ Error checking for active plans: ${planError.message}`);
      return { hasActivePlan: false, hasActivePaymentMethod: false };
    }
    
    // Find the owner of the community
    const { data: communityData, error: communityError } = await supabase
      .from('communities')
      .select('owner_id')
      .eq('id', communityId)
      .single();
    
    if (communityError) {
      await logger.error(`❌ Error finding community owner: ${communityError.message}`);
      return { hasActivePlan: planCount > 0, hasActivePaymentMethod: false };
    }
    
    const ownerId = communityData.owner_id;
    
    // Check for active payment methods owned by the community owner
    const { count: paymentMethodCount, error: paymentError } = await supabase
      .from('payment_methods')
      .select('id', { count: 'exact', head: true })
      .eq('owner_id', ownerId)
      .eq('is_active', true)
      .limit(1);
    
    if (paymentError) {
      await logger.error(`❌ Error checking for active payment methods: ${paymentError.message}`);
      return { hasActivePlan: planCount > 0, hasActivePaymentMethod: false };
    }
    
    const hasActivePlan = (planCount || 0) > 0;
    const hasActivePaymentMethod = (paymentMethodCount || 0) > 0;
    
    await logger.info(`✅ Community ${communityId} requirements check: Active Plans: ${hasActivePlan ? 'YES' : 'NO'}, Active Payment Methods: ${hasActivePaymentMethod ? 'YES' : 'NO'}`);
    
    return { hasActivePlan, hasActivePaymentMethod };
  } catch (error) {
    await logger.error(`❌ Error checking community requirements: ${error.message}`, error);
    return { hasActivePlan: false, hasActivePaymentMethod: false };
  }
}
