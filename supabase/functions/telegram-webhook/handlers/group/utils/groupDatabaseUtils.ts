
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { createLogger } from '../../../services/loggingService.ts';

/**
 * Find a group by ID
 */
export async function findGroupById(supabase: ReturnType<typeof createClient>, groupId: string) {
  const logger = createLogger(supabase, 'GROUP-DATABASE-UTILS');
  
  try {
    await logger.info(`🔍 Looking up group by ID: ${groupId}`);
    
    const { data: group, error } = await supabase
      .from('community_groups')
      .select('*')
      .eq('id', groupId)
      .single();
    
    if (error) {
      await logger.error(`❌ Error fetching group by ID: ${groupId}`, error);
      return { success: false, data: null, error };
    }
    
    await logger.success(`✅ Found group: ${group.name}`);
    return { success: true, data: group, error: null };
  } catch (error) {
    await logger.error(`❌ Unexpected error in findGroupById:`, error);
    return { success: false, data: null, error };
  }
}

/**
 * Check if a group has active subscription plans and payment methods
 */
export async function checkGroupRequirements(supabase: ReturnType<typeof createClient>, groupId: string) {
  const logger = createLogger(supabase, 'GROUP-DATABASE-UTILS');
  
  try {
    await logger.info(`🔍 Checking requirements for group ID: ${groupId}`);
    
    // First, we need to get the owner of this group
    const { data: group, error: groupError } = await supabase
      .from('community_groups')
      .select('owner_id')
      .eq('id', groupId)
      .single();
    
    if (groupError || !group) {
      await logger.error(`❌ Error fetching group owner: ${groupId}`, groupError);
      return { hasActivePlan: false, hasActivePaymentMethod: false };
    }
    
    const ownerId = group.owner_id;
    
    // Check if there's at least one active subscription plan
    const { data: plans, error: plansError } = await supabase
      .from('subscription_plans')
      .select('id')
      .eq('is_active', true)
      .limit(1);
    
    if (plansError) {
      await logger.error(`❌ Error checking subscription plans:`, plansError);
      return { hasActivePlan: false, hasActivePaymentMethod: false };
    }
    
    const hasActivePlan = plans && plans.length > 0;
    
    // Check if there's at least one active payment method for this owner
    const { data: paymentMethods, error: paymentMethodsError } = await supabase
      .rpc('get_available_payment_methods', { community_id_param: groupId })
      .eq('is_active', true)
      .limit(1);
    
    if (paymentMethodsError) {
      await logger.error(`❌ Error checking payment methods:`, paymentMethodsError);
      return { hasActivePlan, hasActivePaymentMethod: false };
    }
    
    const hasActivePaymentMethod = paymentMethods && paymentMethods.length > 0;
    
    await logger.info(`✅ Group requirements check result: Active Plan: ${hasActivePlan}, Active Payment Method: ${hasActivePaymentMethod}`);
    
    return { hasActivePlan, hasActivePaymentMethod };
  } catch (error) {
    await logger.error(`❌ Unexpected error in checkGroupRequirements:`, error);
    return { hasActivePlan: false, hasActivePaymentMethod: false };
  }
}
