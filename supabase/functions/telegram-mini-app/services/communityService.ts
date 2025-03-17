
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.7";

/**
 * Fetches community data based on the provided ID or custom link
 */
export async function fetchCommunityData(
  supabase: ReturnType<typeof createClient>,
  idOrLink: string
) {
  // Check if this is a community ID (UUID) or a custom link
  const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(idOrLink);
  console.log(`🔍 Parameter type: ${isUUID ? "UUID" : "Custom link"} - "${idOrLink}"`);
  
  let communityQuery;
  
  if (isUUID) {
    console.log(`✅ Parameter is a UUID, querying by ID: ${idOrLink}`);
    // If it's a UUID, search by ID
    communityQuery = supabase
      .from("communities")
      .select(`
        id,
        name,
        description,
        telegram_photo_url,
        telegram_chat_id,
        custom_link,
        is_group,
        community_relationships:community_relationships!community_id(
          member_id,
          communities:member_id(
            id, 
            name,
            description,
            telegram_photo_url,
            telegram_chat_id,
            custom_link
          )
        ),
        subscription_plans (
          id,
          name,
          description,
          price,
          interval,
          features,
          is_active,
          community_id
        )
      `)
      .eq("id", idOrLink)
      .single();
  } else {
    console.log(`🔗 Parameter appears to be a custom link: "${idOrLink}"`);
    // If it's not a UUID, search by custom_link
    communityQuery = supabase
      .from("communities")
      .select(`
        id,
        name,
        description,
        telegram_photo_url,
        telegram_chat_id,
        custom_link,
        is_group,
        community_relationships:community_relationships!community_id(
          member_id,
          communities:member_id(
            id, 
            name,
            description,
            telegram_photo_url,
            telegram_chat_id,
            custom_link
          )
        ),
        subscription_plans (
          id,
          name,
          description,
          price,
          interval,
          features,
          is_active,
          community_id
        )
      `)
      .eq("custom_link", idOrLink)
      .single();
  }

  return { communityQuery, entityId: idOrLink };
}

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
    let groupCommunities = [];
    if (data.community_relationships && Array.isArray(data.community_relationships)) {
      groupCommunities = data.community_relationships
        .map(rel => rel.communities)
        .filter(Boolean);
      console.log(`📝 Group has ${groupCommunities.length} communities`);
    }
    
    // For groups, we'll return the group data with its communities
    // Filter out inactive subscription plans
    const activePlans = data.subscription_plans 
      ? data.subscription_plans.filter(plan => plan.is_active) 
      : [];
    
    console.log(`📝 Group has ${activePlans.length} active subscription plans`);
    
    // Debug logging to inspect the structure of active plans
    if (activePlans.length > 0) {
      console.log(`First plan structure: ${JSON.stringify(activePlans[0])}`);
      console.log(`First plan community_id: ${activePlans[0].community_id}`);
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
    // Filter out inactive subscription plans and ensure community_id is set
    const activePlans = data.subscription_plans 
      ? data.subscription_plans.filter(plan => plan.is_active).map(plan => ({
          ...plan,
          community_id: plan.community_id || data.id // Ensure community_id is set
        }))
      : [];
    
    console.log(`✅ Successfully found community: ${data.name} (ID: ${data.id})`);
    console.log(`📝 Community has ${activePlans.length} active subscription plans`);
    
    // Debug logging to inspect the structure of active plans
    if (activePlans.length > 0) {
      console.log(`First plan structure: ${JSON.stringify(activePlans[0])}`);
      console.log(`First plan community_id: ${activePlans[0].community_id}`);
    }
    
    displayCommunity = {
      ...data,
      subscription_plans: activePlans
    };
  }
  
  console.log(`📝 Entity description: "${displayCommunity.description || 'NOT SET'}"`);
  console.log(`🔗 Entity custom_link: "${displayCommunity.custom_link || 'NOT SET'}"`);
  
  return displayCommunity;
}
