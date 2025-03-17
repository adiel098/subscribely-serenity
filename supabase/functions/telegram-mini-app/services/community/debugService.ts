
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.7";

/**
 * Verify plans through direct database checks
 */
export async function verifyPlansInDatabase(
  communityId: string,
  supabase: ReturnType<typeof createClient>
) {
  console.log(`🧪 Verifying plans directly for community ID: ${communityId}`);
  
  try {
    const { data: directPlans, error: directError } = await supabase
      .from('subscription_plans')
      .select('id, name, is_active, community_id')
      .eq('community_id', communityId);
      
    if (directError) {
      console.error(`❌ Error in direct plans query: ${directError.message}`);
      return false;
    } else {
      console.log(`🔍 Direct query found ${directPlans?.length || 0} plans`);
      
      if (directPlans && directPlans.length > 0) {
        const activePlans = directPlans.filter(p => p.is_active);
        console.log(`💡 Found ${activePlans.length} active plans out of ${directPlans.length} total`);
        return true;
      } else {
        console.warn(`⚠️ No plans found via direct query`);
        return false;
      }
    }
  } catch (err) {
    console.error(`❌ Exception in plans verification: ${err}`);
    return false;
  }
}

/**
 * Perform deep verification of plans through multiple methods
 */
export async function deepVerifyPlans(
  communityId: string,
  supabase: ReturnType<typeof createClient>
) {
  console.log(`🔬 Deep verifying plans for community ${communityId}...`);
  
  try {
    // Try using count queries which can be more reliable
    const { count, error: countError } = await supabase
      .from('subscription_plans')
      .select('id', { count: 'exact', head: true })
      .eq('community_id', communityId);
      
    if (countError) {
      console.error(`❌ Error in plans count query: ${countError.message}`);
    } else {
      console.log(`🔢 Count query found ${count} total plans for community`);
    }
    
    // Check active plans specifically
    const { count: activeCount, error: activeError } = await supabase
      .from('subscription_plans')
      .select('id', { count: 'exact', head: true })
      .eq('community_id', communityId)
      .eq('is_active', true);
      
    if (activeError) {
      console.error(`❌ Error in active plans count query: ${activeError.message}`);
    } else {
      console.log(`✅ Count query found ${activeCount} active plans for community`);
    }
    
    return !countError && !activeError;
  } catch (err) {
    console.error(`❌ Exception in deep plans verification: ${err}`);
    return false;
  }
}

/**
 * Debug and validate plan data structure
 */
export function debugPlans(plans) {
  if (!plans || !Array.isArray(plans)) {
    console.warn(`⚠️ plans array is null, undefined or not an array`);
    return;
  }
  
  console.log(`🔍 Debugging ${plans.length} plans:`);
  
  // Check for missing fields
  const missingFields = {
    id: 0,
    name: 0,
    price: 0,
    interval: 0,
    community_id: 0
  };
  
  plans.forEach((plan, i) => {
    if (!plan.id) missingFields.id++;
    if (!plan.name) missingFields.name++;
    if (typeof plan.price !== 'number') missingFields.price++;
    if (!plan.interval) missingFields.interval++;
    if (!plan.community_id) missingFields.community_id++;
    
    console.debug(`Plan ${i+1}: ${plan.name || 'unnamed'} (${plan.id || 'no ID'}) - $${plan.price || '?'} ${plan.interval || '?'}`);
  });
  
  // Report missing fields
  const hasMissingFields = Object.values(missingFields).some(count => count > 0);
  if (hasMissingFields) {
    console.warn(`⚠️ Found plans with missing fields:`, missingFields);
  } else {
    console.log(`✅ All plans have required fields`);
  }
}

/**
 * Ensure all plans have the required fields to prevent frontend issues
 */
export function ensurePlanFields(plans) {
  if (!plans || !Array.isArray(plans)) {
    console.warn(`⚠️ Cannot ensure plan fields: plans is null, undefined or not an array`);
    return [];
  }
  
  return plans.map(plan => ({
    id: plan.id || `plan-${Math.random().toString(36).substring(2, 9)}`,
    name: plan.name || "Untitled Plan",
    description: plan.description || "",
    price: typeof plan.price === 'number' ? plan.price : 0,
    interval: plan.interval || "month",
    features: Array.isArray(plan.features) ? plan.features : [],
    is_active: Boolean(plan.is_active),
    community_id: plan.community_id,
    created_at: plan.created_at || new Date().toISOString(),
    updated_at: plan.updated_at || new Date().toISOString()
  }));
}
