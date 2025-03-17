
import { SubscriptionPlan } from "@/group_owners/hooks/types/subscription.types";
import { createLogger } from "./debugUtils";

const logger = createLogger("planDebugUtils");

/**
 * Validates a subscription plan to ensure it has all required fields
 * This is useful for debugging plan-related issues
 */
export const validatePlan = (plan: SubscriptionPlan, index: number = 0): string[] => {
  const errors: string[] = [];
  
  if (!plan.id) errors.push(`Plan ${index}: Missing ID`);
  if (!plan.name) errors.push(`Plan ${index}: Missing name`);
  if (typeof plan.price !== 'number') errors.push(`Plan ${index}: Invalid price (${plan.price})`);
  if (!plan.interval) errors.push(`Plan ${index}: Missing interval`);
  if (!plan.created_at) errors.push(`Plan ${index}: Missing created_at field`);
  if (!plan.updated_at) errors.push(`Plan ${index}: Missing updated_at field`);
  if (!plan.community_id) errors.push(`Plan ${index}: Missing community_id field`);
  
  return errors;
};

/**
 * Debug utility to check a collection of plans for issues
 */
export const debugPlans = (plans: SubscriptionPlan[] | null | undefined): void => {
  if (!plans || !Array.isArray(plans)) {
    logger.error(`Invalid plans data: ${typeof plans}, value:`, plans);
    return;
  }
  
  logger.log(`Analyzing ${plans.length} plans for issues...`);
  
  if (plans.length === 0) {
    logger.warn("No plans found to analyze");
    return;
  }
  
  // Check each plan for potential issues
  const allErrors: string[] = [];
  
  plans.forEach((plan, index) => {
    const planErrors = validatePlan(plan, index + 1);
    if (planErrors.length > 0) {
      allErrors.push(...planErrors);
    }
    
    // Log detailed plan information
    logger.debug(`Plan ${index + 1} details:`, {
      id: plan.id,
      name: plan.name,
      community_id: plan.community_id || 'MISSING',
      price: plan.price,
      interval: plan.interval,
      is_active: plan.is_active,
      features: Array.isArray(plan.features) ? plan.features.length : 'not an array'
    });
  });
  
  if (allErrors.length > 0) {
    logger.error(`Found ${allErrors.length} issues with plans:`, allErrors);
  } else {
    logger.success(`All ${plans.length} plans are valid!`);
  }
  
  // Log the first plan for reference
  if (plans.length > 0) {
    logger.debug("Sample plan data:", plans[0]);
  }
};

/**
 * Utility to transform plan data to ensure it has required fields
 * Can help fix frontend issues when backend is returning incomplete data
 */
export const ensurePlanFields = (plans: any[]): SubscriptionPlan[] => {
  if (!plans || !Array.isArray(plans)) {
    logger.warn("Cannot process plans: Invalid input, got:", typeof plans);
    if (plans !== null && plans !== undefined) {
      logger.debug("Plans value:", plans);
    }
    return [];
  }
  
  return plans.map((plan, index) => {
    const now = new Date().toISOString();
    const originalPlan = { ...plan };
    
    // Ensure all required fields are present
    const fixedPlan: SubscriptionPlan = {
      id: plan.id || `missing-id-${index}`,
      community_id: plan.community_id || '', // This could be a problem if missing
      name: plan.name || `Unnamed Plan ${index + 1}`,
      description: plan.description || null,
      price: typeof plan.price === 'number' ? plan.price : 0,
      interval: plan.interval || 'monthly',
      features: Array.isArray(plan.features) ? plan.features : [],
      is_active: plan.is_active !== false, // Default to true if not specified
      created_at: plan.created_at || now,
      updated_at: plan.updated_at || now
    };
    
    // Log any fixes we made
    const original = JSON.stringify(originalPlan);
    const fixed = JSON.stringify(fixedPlan);
    
    if (original !== fixed) {
      logger.debug(`Fixed plan ${index + 1}:`, { 
        original, 
        fixed, 
        changes: Object.keys(fixedPlan).filter(key => 
          JSON.stringify(originalPlan[key]) !== JSON.stringify(fixedPlan[key])
        )
      });
    }
    
    return fixedPlan;
  });
};

/**
 * Performs a direct database query to verify plans exist for a community
 */
export const verifyPlansInDatabase = async (communityId: string, supabase: any): Promise<void> => {
  try {
    logger.debug(`Verifying plans in database for community ID: ${communityId}`);
    
    // First, check if the community exists
    const { data: communityData, error: communityError } = await supabase
      .from('communities')
      .select('id, name')
      .eq('id', communityId)
      .single();
      
    if (communityError) {
      logger.error(`Community not found: ${communityError.message}`);
      return;
    }
    
    logger.debug(`Found community: ${communityData.name} (${communityData.id})`);
    
    // Now check for plans
    const { data, error, count } = await supabase
      .from('subscription_plans')
      .select('id, name, community_id, is_active', { count: 'exact' })
      .eq('community_id', communityId);
      
    if (error) {
      logger.error(`Database error checking plans: ${error.message}`);
      return;
    }
    
    if (!data || data.length === 0) {
      logger.warn(`No plans found in database for community ID: ${communityId}`);
      
      // Check if plans exist for other communities to verify the table works
      const { data: samplePlans, error: sampleError } = await supabase
        .from('subscription_plans')
        .select('community_id, name')
        .limit(5);
        
      if (sampleError) {
        logger.error(`Error checking sample plans: ${sampleError.message}`);
      } else if (samplePlans && samplePlans.length > 0) {
        logger.debug(`Found ${samplePlans.length} plans for other communities:`, samplePlans);
        
        // Check if there's another community with plans that we can use as a reference
        const uniqueCommunities = [...new Set(samplePlans.map(p => p.community_id))];
        logger.debug(`These plans belong to ${uniqueCommunities.length} different communities`);
      } else {
        logger.warn('No plans found in the entire database!');
      }
      
      return;
    }
    
    const activePlans = data.filter(plan => plan.is_active);
    logger.success(`Found ${data.length} total plans in database (${activePlans.length} active)`);
    logger.debug(`Database plans:`, data);
    
    // Additional check - make sure the community_id matches
    const mismatchedPlans = data.filter(plan => plan.community_id !== communityId);
    if (mismatchedPlans.length > 0) {
      logger.warn(`Found ${mismatchedPlans.length} plans with mismatched community_id!`);
      logger.debug('Mismatched plans:', mismatchedPlans);
    }
  } catch (error) {
    logger.error(`Error verifying plans in database:`, error);
  }
};

/**
 * Deep verify that plans exist and are correctly associated with a community
 */
export const deepVerifyPlans = async (communityId: string, supabase: any): Promise<void> => {
  try {
    logger.debug(`🔍 Deep verification of plans for community ID: ${communityId}`);
    
    // First, check direct table access
    const { data: directPlans, error: directError } = await supabase
      .from('subscription_plans')
      .select('*')
      .eq('community_id', communityId);
      
    if (directError) {
      logger.error(`❌ Direct table access error: ${directError.message}`);
    } else {
      logger.success(`✅ Direct table access found ${directPlans?.length || 0} plans`);
      logger.debug('Direct plans:', directPlans);
    }
    
    // Next, try using RPC if available
    try {
      logger.debug(`🔍 Attempting RPC call to get plans...`);
      const { data: rpcPlans, error: rpcError } = await supabase.rpc(
        'get_community_plans',
        { community_id_param: communityId }
      );
      
      if (rpcError) {
        logger.warn(`⚠️ RPC access unavailable: ${rpcError.message}`);
      } else {
        logger.success(`✅ RPC found ${rpcPlans?.length || 0} plans`);
        logger.debug('RPC plans:', rpcPlans);
      }
    } catch (rpcError) {
      logger.warn(`⚠️ RPC attempt failed: ${rpcError.message}`);
    }
    
    // Finally, try the edge function
    try {
      logger.debug(`🔍 Testing edge function...`);
      const { data: edgeFunctionData, error: edgeFunctionError } = await supabase.functions.invoke(
        'telegram-community-data',
        { body: { community_id: communityId, debug: true } }
      );
      
      if (edgeFunctionError) {
        logger.error(`❌ Edge function error: ${edgeFunctionError.message}`);
      } else if (edgeFunctionData?.community) {
        logger.success(`✅ Edge function found community with ${edgeFunctionData.community.subscription_plans?.length || 0} plans`);
        logger.debug('Edge function plans:', edgeFunctionData.community.subscription_plans);
      } else {
        logger.warn(`⚠️ Edge function returned no community or plans`);
      }
    } catch (edgeError) {
      logger.error(`❌ Edge function attempt failed: ${edgeError.message}`);
    }
  } catch (error) {
    logger.error(`❌ Error in deep verification:`, error);
  }
};
