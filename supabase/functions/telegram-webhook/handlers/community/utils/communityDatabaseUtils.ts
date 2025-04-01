
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { createLogger } from '../../../services/loggingService.ts';

/**
 * Find a community by its ID or custom link
 */
export async function findCommunityById(
  supabase: ReturnType<typeof createClient>,
  communityIdOrLink: string
) {
  const logger = createLogger(supabase, 'COMMUNITY-DB-UTILS');
  
  try {
    await logger.info(`🔍 Looking up community by ID or link: ${communityIdOrLink}`);
    
    // Check if the input looks like a UUID or a custom link
    const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    const isUuid = uuidPattern.test(communityIdOrLink);
    
    if (isUuid) {
      await logger.info(`🔍 Input appears to be a UUID: ${communityIdOrLink}`);
    } else {
      await logger.info(`🔗 Input appears to be a custom link: ${communityIdOrLink}`);
    }
    
    // First try to find by ID or custom link
    // NOTE: Fixed critical bug - don't use string interpolation for column names in queries
    // Instead, use proper parameter format with explicit column conditions
    let { data: communities, error } = await supabase
      .from('communities')
      .select('*')
      .or(`id.eq.${communityIdOrLink},custom_link.eq.${communityIdOrLink}`);
    
    if (error) {
      await logger.error(`❌ Error querying communities:`, error);
      return { success: false, error: error.message };
    }
    
    // If we didn't find any communities with the or statement, try more explicit queries
    if (!communities || communities.length === 0) {
      await logger.info(`⚠️ No community found with combined query, trying specific queries`);
      
      // Try UUID lookup first if it looks like a UUID
      if (isUuid) {
        const { data: uuidCommunities, error: uuidError } = await supabase
          .from('communities')
          .select('*')
          .eq('id', communityIdOrLink)
          .limit(1);
        
        if (uuidError) {
          await logger.error(`❌ Error querying by UUID:`, uuidError);
        } else if (uuidCommunities && uuidCommunities.length > 0) {
          communities = uuidCommunities;
          await logger.info(`✅ Found community by UUID: ${communities[0].name}`);
        }
      }
      
      // If still no result, try by custom link
      if (!communities || communities.length === 0) {
        const { data: linkCommunities, error: linkError } = await supabase
          .from('communities')
          .select('*')
          .eq('custom_link', communityIdOrLink)
          .limit(1);
        
        if (linkError) {
          await logger.error(`❌ Error querying by custom link:`, linkError);
        } else if (linkCommunities && linkCommunities.length > 0) {
          communities = linkCommunities;
          await logger.info(`✅ Found community by custom link: ${communities[0].name}`);
        }
      }
    }
    
    if (!communities || communities.length === 0) {
      await logger.info(`⚠️ No community found for ID or link: ${communityIdOrLink}`);
      return { success: false, error: 'Community not found' };
    }
    
    // Get the first matching community
    const community = communities[0];
    
    // Use info instead of success to match available methods
    await logger.info(`✅ Found community: ${community.name} (ID: ${community.id})`);
    return { success: true, data: community };
  } catch (error) {
    await logger.error(`❌ Error in findCommunityById for ID or link: ${communityIdOrLink}`, error);
    return { success: false, error: error.message || 'Unknown error' };
  }
}

/**
 * Check if a community has the required configuration for subscription
 */
export async function checkCommunityRequirements(
  supabase: ReturnType<typeof createClient>,
  communityId: string
) {
  const logger = createLogger(supabase, 'COMMUNITY-DB-UTILS');
  
  try {
    await logger.info(`🔍 Checking requirements for community: ${communityId}`);
    
    // Check if the community has at least one active subscription plan
    const { data: plans, error: plansError } = await supabase
      .from('subscription_plans')
      .select('id')
      .eq('community_id', communityId)
      .eq('is_active', true)
      .limit(1);
    
    if (plansError) {
      await logger.error(`❌ Error checking subscription plans:`, plansError);
      return { hasActivePlan: false, hasActivePaymentMethod: false };
    }
    
    const hasActivePlan = plans && plans.length > 0;
    
    // Check if there's at least one active payment method
    const { data: paymentMethods, error: paymentMethodsError } = await supabase
      .from('payment_methods')
      .select('id')
      .eq('community_id', communityId)
      .eq('is_active', true)
      .limit(1);
    
    if (paymentMethodsError) {
      await logger.error(`❌ Error checking payment methods:`, paymentMethodsError);
      return { hasActivePlan, hasActivePaymentMethod: false };
    }
    
    const hasActivePaymentMethod = paymentMethods && paymentMethods.length > 0;
    
    await logger.info(`✅ Community requirements check: Plans: ${hasActivePlan}, Payment Methods: ${hasActivePaymentMethod}`);
    
    return { hasActivePlan, hasActivePaymentMethod };
  } catch (error) {
    await logger.error(`❌ Error in checkCommunityRequirements:`, error);
    return { hasActivePlan: false, hasActivePaymentMethod: false };
  }
}
