
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.7";

/**
 * Fetch subscription plans directly for a community
 */
export async function fetchPlansDirectly(
  supabase: ReturnType<typeof createClient>,
  communityId: string
) {
  console.log(`⚠️ Fetching plans for community ID: ${communityId}`);
  
  try {
    // First get the project_id for this community
    const { data: communityData, error: communityError } = await supabase
      .from("communities")
      .select("project_id")
      .eq("id", communityId)
      .single();
    
    if (communityError || !communityData?.project_id) {
      console.error(`❌ Error fetching community project_id: ${communityError?.message}`);
      return [];
    }
    
    const projectId = communityData.project_id;
    console.log(`📋 Found project_id: ${projectId} for community: ${communityId}`);
    
    // Then fetch plans using project_id
    const { data: plansData, error: plansError } = await supabase
      .from('project_plans')
      .select('id, name, description, price, interval, features, is_active')
      .eq('project_id', projectId);
      
    if (plansError) {
      console.error(`❌ Error fetching subscription plans: ${plansError.message}`);
      console.error(`❌ Error details:`, JSON.stringify(plansError));
      return [];
    } else {
      console.log(`📊 Directly fetched ${plansData?.length || 0} subscription plans`);
      return plansData || [];
    }
  } catch (err) {
    console.error(`❌ Exception fetching subscription plans: ${err}`);
    return [];
  }
}

/**
 * Check permissions to diagnose if it's a permissions issue
 */
export async function checkPlansPermissions(
  supabase: ReturnType<typeof createClient>
) {
  try {
    const { count, error: countError } = await supabase
      .from('project_plans')
      .select('id', { count: 'exact', head: true });
      
    if (countError) {
      console.error(`❌ Permission error checking plans: ${countError.message}`);
      console.error(`❌ This suggests a permissions issue with the project_plans table`);
      return false;
    } else {
      console.log(`🔐 Successfully counted ${count} total plans in database - permissions seem OK`);
      return true;
    }
  } catch (err) {
    console.error(`❌ Exception checking plan permissions: ${err}`);
    return false;
  }
}

/**
 * Process and filter subscription plans
 */
export function processSubscriptionPlans(plans, communityId) {
  if (!plans || !Array.isArray(plans)) {
    return [];
  }
  
  // Filter out inactive subscription plans
  return plans
    .filter(plan => plan.is_active)
    .map(plan => ({
      ...plan,
      // The community_id is added here for backward compatibility with frontend components
      // This doesn't have to come from the database since frontend components expect it
      community_id: communityId
    }));
}
