
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.7";
import { processSubscriptionPlans, fetchPlansDirectly, checkPlansPermissions } from "./plansService.ts";
import { processGroupCommunities, fetchGroupMemberCommunities } from "./groupService.ts";
import { verifyPlansInDatabase, deepVerifyPlans, debugPlans, ensurePlanFields } from "./debugService.ts";

/**
 * Processes community data and formats it for the response
 */
export async function processCommunityData(
  supabase: ReturnType<typeof createClient>,
  data: any
) {
  let displayCommunity;
  
  if (data.is_group) {
    console.log(`✅ Successfully found group: ${data.name} (ID: ${data.id})`);
    
    // Extract communities from relationships
    let groupCommunities = await processGroupCommunities(supabase, data);
    
    // Check if we have subscription plans directly on the group
    if (!data.subscription_plans || !Array.isArray(data.subscription_plans)) {
      console.log(`⚠️ No subscription plans on group data, fetching plans directly...`);
      data.subscription_plans = await fetchPlansDirectly(supabase, data.id);
    }
    
    // Filter out inactive subscription plans
    const activePlans = processSubscriptionPlans(data.subscription_plans, data.id);
    
    console.log(`📝 Group has ${activePlans.length} active subscription plans out of ${data.subscription_plans?.length || 0} total`);
    
    // Debug logging to inspect the structure of active plans
    if (activePlans.length > 0) {
      console.log(`First plan structure: ${JSON.stringify(activePlans[0])}`);
      console.log(`First plan community_id: ${activePlans[0].community_id}`);
    } else {
      console.log(`⚠️ No active plans found for group: ${data.id}`);
      
      // Check permissions
      await checkPlansPermissions(supabase);
    }
    
    displayCommunity = {
      id: data.id,
      name: data.name,
      description: data.description || "Group subscription",
      telegram_photo_url: data.telegram_photo_url,
      telegram_chat_id: data.telegram_chat_id,
      custom_link: data.custom_link,
      is_group: true,
      communities: groupCommunities || [],
      subscription_plans: activePlans
    };
    
  } else {
    // Standard community display
    // Check if we need to fetch plans directly
    if (!data.subscription_plans || !Array.isArray(data.subscription_plans)) {
      console.log(`⚠️ No subscription plans on community data, fetching plans directly...`);
      data.subscription_plans = await fetchPlansDirectly(supabase, data.id);
    }
    
    // Filter out inactive subscription plans and ensure community_id is set
    const activePlans = processSubscriptionPlans(data.subscription_plans, data.id);
    
    console.log(`✅ Successfully found community: ${data.name} (ID: ${data.id})`);
    console.log(`📝 Community has ${activePlans.length} active subscription plans out of ${data.subscription_plans?.length || 0} total`);
    
    // Debug logging to inspect the structure of active plans
    if (activePlans.length > 0) {
      console.log(`First plan structure: ${JSON.stringify(activePlans[0])}`);
      console.log(`First plan community_id: ${activePlans[0].community_id}`);
    } else {
      console.log(`⚠️ No active plans found for community: ${data.id}`);
      
      // Check permissions
      await checkPlansPermissions(supabase);
    }
    
    displayCommunity = {
      ...data,
      subscription_plans: activePlans
    };
  }
  
  // Add full debug verification to help diagnose permission issues
  await verifyPlansInDatabase(displayCommunity.id, supabase);
  await deepVerifyPlans(displayCommunity.id, supabase);
  
  // Debug and normalize plans
  debugPlans(displayCommunity.subscription_plans);
  displayCommunity.subscription_plans = ensurePlanFields(displayCommunity.subscription_plans);
  
  console.log(`📝 Entity description: "${displayCommunity.description || 'NOT SET'}"`);
  console.log(`🔗 Entity custom_link: "${displayCommunity.custom_link || 'NOT SET'}"`);
  
  return displayCommunity;
}
