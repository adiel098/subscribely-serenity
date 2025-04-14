import { createLogger } from "@/telegram-mini-app/utils/debugUtils";

const logger = createLogger("planDebugUtils");

/**
 * Verifies if plans exist in the database for a community
 */
export const verifyPlansInDatabase = async (communityId: string, supabase: any) => {
  try {
    logger.log(`Verifying subscription plans for community ID: ${communityId}`);
    
    // First, check count with a simple query
    const { count, error: countError } = await supabase
      .from('project_plans')
      .select('id', { count: 'exact', head: true })
      .eq('community_id', communityId);
      
    if (countError) {
      logger.error(`Error counting plans: ${countError.message}`);
    } else {
      logger.info(`Total plans in database for community ${communityId}: ${count}`);
    }
    
    // Then get all plans to inspect them
    const { data: plans, error } = await supabase
      .from('project_plans')
      .select('id, name, price, interval, is_active, community_id')
      .eq('community_id', communityId);
      
    if (error) {
      logger.error(`Error fetching plans: ${error.message}`);
      return;
    }
    
    logger.log(`Found ${plans?.length || 0} plans in database for community ${communityId}`);
    
    if (plans && plans.length > 0) {
      // Check if any plans are missing their community_id
      const missingCommunityIdPlans = plans.filter(p => !p.community_id);
      if (missingCommunityIdPlans.length > 0) {
        logger.warn(`Found ${missingCommunityIdPlans.length} plans with missing community_id!`);
        logger.debug('Plans with missing community_id:', JSON.stringify(missingCommunityIdPlans));
      }
      
      // Check if any active plans exist
      const activePlans = plans.filter(p => p.is_active);
      if (activePlans.length === 0) {
        logger.warn(`No active plans found for community ${communityId}!`);
      } else {
        logger.info(`Found ${activePlans.length} active plans for community ${communityId}`);
      }
      
      // Log each plan for debugging
      plans.forEach((plan, index) => {
        logger.debug(`Plan ${index + 1}: ${plan.name} (${plan.id}), active: ${plan.is_active}, community_id: ${plan.community_id || 'MISSING'}`);
      });
    } else {
      logger.warn(`No plans found for community ${communityId}!`);
    }
  } catch (error) {
    logger.error(`Error verifying plans: ${error}`);
  }
};

/**
 * Performs deep verification of plans using multiple methods
 */
export const deepVerifyPlans = async (communityId: string, supabase: any) => {
  try {
    logger.group(`Deep verification of plans for community ${communityId}`);
    
    // Try different querying strategies
    logger.log(`Method 1: Direct plans query`);
    const { data: plansMethod1, error: error1 } = await supabase
      .from('project_plans')
      .select('*')
      .eq('community_id', communityId);
      
    if (error1) {
      logger.error(`Method 1 error: ${error1.message}`);
    } else {
      logger.log(`Method 1 found ${plansMethod1?.length || 0} plans`);
    }
    
    logger.log(`Method 2: Community with nested plans query`);
    const { data: communityData, error: error2 } = await supabase
      .from('communities')
      .select(`
        id, 
        name,
        project_plans (*)
      `)
      .eq('id', communityId)
      .single();
      
    if (error2) {
      logger.error(`Method 2 error: ${error2.message}`);
    } else {
      const plansCount = communityData?.project_plans?.length || 0;
      logger.log(`Method 2 found ${plansCount} plans for community ${communityData?.name || 'unknown'}`);
    }
    
    logger.groupEnd();
  } catch (error) {
    logger.error(`Error in deep verification: ${error}`);
  }
};

/**
 * Debug utility to check plan structures for issues
 */
export const debugPlans = (plans: any[] | null | undefined) => {
  if (!plans || !Array.isArray(plans) || plans.length === 0) {
    logger.warn('No plans to debug');
    return;
  }
  
  logger.group(`Debugging ${plans.length} plans`);
  
  // Check for common issues
  const missingCommunityId = plans.filter(p => !p.community_id);
  const missingPrice = plans.filter(p => p.price === undefined || p.price === null);
  const missingInterval = plans.filter(p => !p.interval);
  const missingName = plans.filter(p => !p.name);
  
  // Log issues found
  if (missingCommunityId.length > 0) {
    logger.warn(`${missingCommunityId.length} plans missing community_id`);
  }
  
  if (missingPrice.length > 0) {
    logger.warn(`${missingPrice.length} plans missing price`);
  }
  
  if (missingInterval.length > 0) {
    logger.warn(`${missingInterval.length} plans missing interval`);
  }
  
  if (missingName.length > 0) {
    logger.warn(`${missingName.length} plans missing name`);
  }
  
  // Log a sample plan for structure reference
  logger.debug('Sample plan structure:', plans[0]);
  
  logger.groupEnd();
};

/**
 * Ensures all plans have the required fields to prevent frontend errors
 */
export const ensurePlanFields = (plans: any[] | null | undefined) => {
  if (!plans || !Array.isArray(plans)) {
    return [];
  }
  
  return plans.map(plan => ({
    id: plan.id || `missing-id-${Date.now()}`,
    name: plan.name || 'Unnamed Plan',
    description: plan.description || '',
    price: plan.price !== undefined ? plan.price : 0,
    interval: plan.interval || 'monthly',
    features: plan.features || [],
    is_active: plan.is_active !== undefined ? plan.is_active : true,
    community_id: plan.community_id || '', // Will be filled in by parent context if needed
    created_at: plan.created_at || new Date().toISOString(),
    updated_at: plan.updated_at || new Date().toISOString()
  }));
};

/**
 * Check which field holds the duration in the plan
 */
export const getFirstPlanDuration = async (communityId: string, supabase: any) => {
  try {
    const { data, error } = await supabase
      .from('project_plans')
      .select('*')
      .eq('community_id', communityId)
      .limit(1)
      .maybeSingle();
  } catch (error) {
    logger.error(`Error getting first plan duration: ${error}`);
  }
};
