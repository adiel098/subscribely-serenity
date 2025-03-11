
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
    
    // Check if there's at least one active subscription plan specifically for this group
    const { data: plans, error: plansError } = await supabase
      .from('subscription_plans')
      .select('id')
      .eq('group_id', groupId)
      .eq('is_active', true)
      .limit(1);
    
    if (plansError) {
      await logger.error(`❌ Error checking subscription plans:`, plansError);
      return { hasActivePlan: false, hasActivePaymentMethod: false };
    }
    
    const hasActivePlan = plans && plans.length > 0;
    await logger.info(`Group has active subscription plans: ${hasActivePlan ? 'Yes' : 'No'}`);
    
    // Check direct payment methods for this group
    const { data: directMethods, error: directMethodsError } = await supabase
      .from('payment_methods')
      .select('id')
      .eq('group_id', groupId)
      .eq('is_active', true)
      .limit(1);
      
    if (directMethodsError) {
      await logger.error(`❌ Error checking direct payment methods:`, directMethodsError);
      return { hasActivePlan, hasActivePaymentMethod: false };
    }
    
    // If group has direct payment methods, we can return early
    if (directMethods && directMethods.length > 0) {
      await logger.info(`Group has direct payment methods: Yes`);
      return { hasActivePlan, hasActivePaymentMethod: true };
    }
    
    // Check if there's at least one default payment method available
    const { data: defaultMethods, error: defaultMethodsError } = await supabase
      .from('payment_methods')
      .select('id')
      .eq('is_default', true)
      .eq('is_active', true)
      .limit(1);
      
    if (defaultMethodsError) {
      await logger.error(`❌ Error checking default payment methods:`, defaultMethodsError);
      return { hasActivePlan, hasActivePaymentMethod: false };
    }
    
    const hasActivePaymentMethod = (defaultMethods && defaultMethods.length > 0);
    
    await logger.info(`Group requirements check result: Active Plan: ${hasActivePlan}, Active Payment Method: ${hasActivePaymentMethod}`);
    
    return { hasActivePlan, hasActivePaymentMethod };
  } catch (error) {
    await logger.error(`❌ Unexpected error in checkGroupRequirements:`, error);
    return { hasActivePlan: false, hasActivePaymentMethod: false };
  }
}
