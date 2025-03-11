
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { createLogger } from '../../../services/loggingService.ts';

/**
 * Find a community by its ID
 */
export async function findCommunityById(supabase: ReturnType<typeof createClient>, communityId: string) {
  const logger = createLogger(supabase, 'COMMUNITY-DB-UTILS');
  
  try {
    await logger.info(`🔍 Looking up community by ID: ${communityId}`);
    
    const { data: community, error: communityError } = await supabase
      .from('communities')
      .select('id, name, telegram_chat_id')
      .eq('id', communityId)
      .single();
    
    if (communityError || !community) {
      await logger.error(`❌ Community not found: ${communityError?.message || 'Unknown error'}`);
      return { success: false, error: communityError };
    }
    
    await logger.success(`✅ Found community: ${community.name}`);
    return { success: true, data: community };
  } catch (error) {
    await logger.error(`❌ Error in findCommunityById for ID: ${communityId}`, error);
    throw error;
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
    
    // Check for active payment methods
    const { count: paymentMethodCount, error: paymentError } = await supabase
      .from('payment_methods')
      .select('id', { count: 'exact', head: true })
      .eq('community_id', communityId)
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
