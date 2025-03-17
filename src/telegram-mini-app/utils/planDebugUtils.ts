
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
    logger.error(`Invalid plans data: ${typeof plans}`);
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
    logger.debug(`Plan ${index + 1} details:`, JSON.stringify({
      id: plan.id,
      name: plan.name,
      community_id: plan.community_id || 'MISSING',
      price: plan.price,
      interval: plan.interval,
      is_active: plan.is_active,
      features: Array.isArray(plan.features) ? plan.features.length : 'not an array'
    }));
  });
  
  if (allErrors.length > 0) {
    logger.error(`Found ${allErrors.length} issues with plans:`, allErrors);
  } else {
    logger.success(`All ${plans.length} plans are valid!`);
  }
  
  // Log the first plan for reference
  logger.debug("Sample plan data:", JSON.stringify(plans[0]));
};

/**
 * Utility to transform plan data to ensure it has required fields
 * Can help fix frontend issues when backend is returning incomplete data
 */
export const ensurePlanFields = (plans: any[]): SubscriptionPlan[] => {
  if (!plans || !Array.isArray(plans)) {
    logger.warn("Cannot process plans: Invalid input");
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
    
    const { data, error } = await supabase
      .from('subscription_plans')
      .select('id, name, community_id, is_active')
      .eq('community_id', communityId);
      
    if (error) {
      logger.error(`Database error checking plans: ${error.message}`);
      return;
    }
    
    if (!data || data.length === 0) {
      logger.warn(`No plans found in database for community ID: ${communityId}`);
      return;
    }
    
    const activePlans = data.filter(plan => plan.is_active);
    logger.success(`Found ${data.length} total plans in database (${activePlans.length} active)`);
    logger.debug(`Database plans:`, JSON.stringify(data));
  } catch (error) {
    logger.error(`Error verifying plans in database:`, error);
  }
};
