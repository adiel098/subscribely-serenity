
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.7";

/**
 * Fetches community data based on the provided ID
 */
export async function fetchCommunityData(
  supabase: ReturnType<typeof createClient>,
  start: string
) {
  // Check if start parameter is for a group (prefixed with "group_")
  const isGroupRequest = start.toString().startsWith("group_");
  console.log(`🔍 Parameter type: ${isGroupRequest ? "Group" : "Community"} ID - "${start}"`);
  
  let communityQuery;
  let entityId = start;
  
  // Handle group requests
  if (isGroupRequest) {
    // Extract the actual group ID
    entityId = start.toString().substring(6);
    console.log(`🔍 Extracted group ID: "${entityId}"`);
    
    // Query for groups
    communityQuery = supabase
      .from("community_groups")
      .select(`
        id,
        name,
        description,
        owner_id,
        telegram_chat_id,
        telegram_invite_link,
        communities (
          id,
          name,
          description,
          telegram_photo_url,
          telegram_invite_link,
          telegram_chat_id
        )
      `)
      .eq("id", entityId)
      .single();
  } else {
    // Handle standard community requests (UUID or custom link)
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(start);
    
    if (isUUID) {
      console.log(`✅ Parameter is a UUID, querying by ID: ${start}`);
      // If it's a UUID, search by ID
      communityQuery = supabase
        .from("communities")
        .select(`
          id,
          name,
          description,
          telegram_photo_url,
          telegram_invite_link,
          telegram_chat_id,
          subscription_plans (
            id,
            name,
            description,
            price,
            interval,
            features
          )
        `)
        .eq("id", start)
        .single();
    } else {
      console.log(`🔗 Parameter appears to be a custom link: "${start}"`);
      // If it's not a UUID, search by custom_link
      communityQuery = supabase
        .from("communities")
        .select(`
          id,
          name,
          description,
          telegram_photo_url,
          telegram_invite_link,
          telegram_chat_id,
          subscription_plans (
            id,
            name,
            description,
            price,
            interval,
            features
          )
        `)
        .eq("custom_link", start)
        .single();
    }
  }

  return { communityQuery, isGroupRequest, entityId };
}

/**
 * Processes community data and formats it for the response
 */
export async function processCommunityData(
  supabase: ReturnType<typeof createClient>,
  data: any,
  isGroupRequest: boolean
) {
  let displayCommunity;
  
  if (isGroupRequest) {
    console.log(`✅ Successfully found group: ${data.name} (ID: ${data.id})`);
    console.log(`📝 Group has ${data.communities?.length || 0} communities`);
    
    // For groups, we'll return the group data with its communities
    displayCommunity = {
      id: data.id,
      name: data.name,
      description: data.description || "Group subscription",
      telegram_photo_url: null, // Groups may not have photos
      telegram_invite_link: data.telegram_invite_link,
      telegram_chat_id: data.telegram_chat_id,
      is_group: true,
      communities: data.communities || [],
      subscription_plans: [] // Will fetch separately if needed
    };
    
    // Fetch subscription plans for the group
    const { data: groupPlans, error: groupPlansError } = await supabase
      .from("subscription_plans")
      .select("*")
      .eq("group_id", data.id);
      
    if (!groupPlansError && groupPlans) {
      displayCommunity.subscription_plans = groupPlans;
      console.log(`📊 Found ${groupPlans.length} subscription plans for group`);
    } else if (groupPlansError) {
      console.error("Error fetching group plans:", groupPlansError);
    }
    
  } else {
    // Standard community display
    console.log(`✅ Successfully found community: ${data.name} (ID: ${data.id})`);
    displayCommunity = data;
  }
  
  console.log(`📝 Entity description: "${displayCommunity.description || 'NOT SET'}"`);
  
  return displayCommunity;
}
