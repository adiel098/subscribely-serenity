
/**
 * Service functions for community-related operations
 */

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.7";

/**
 * Fetch community data based on ID or custom link
 * @param supabase Supabase client
 * @param start Community identifier (ID or custom link)
 * @returns Query and entity ID
 */
export async function fetchCommunityData(
  supabase: ReturnType<typeof createClient>,
  start: string
) {
  try {
    console.log(`🔍 Looking up community with identifier: ${start}`);

    // Check if the identifier is a UUID
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(start);
    
    let communityQuery;
    const entityId = start;
    
    if (isUUID) {
      // If it's a UUID, try to find community by ID
      console.log(`✓ Identifier appears to be a UUID: ${start}`);
      communityQuery = supabase
        .from('communities')
        .select('*')
        .eq('id', start);
    } else {
      // If it's not a UUID, look up by custom link
      console.log(`✓ Identifier appears to be a custom link: ${start}`);
      communityQuery = supabase
        .from('communities')
        .select('*')
        .eq('custom_link', start);
    }
    
    return { communityQuery, entityId };
  } catch (error) {
    console.error("❌ Error in fetchCommunityData:", error);
    throw error;
  }
}

/**
 * Process community data for display
 * @param supabase Supabase client
 * @param data Community data from database
 * @returns Processed community data for display
 */
export async function processCommunityData(
  supabase: ReturnType<typeof createClient>,
  data: any
) {
  try {
    if (!data || data.length === 0) {
      console.error("❌ No community data found");
      throw new Error("Community not found");
    }

    // Get the first community if there are multiple results
    const community = Array.isArray(data) ? data[0] : data;
    console.log(`✅ Found community: ${community.name} (ID: ${community.id})`);

    // Create a display-friendly community object
    const displayCommunity = {
      id: community.id,
      name: community.name,
      description: community.description || "",
      owner_id: community.owner_id,
      telegram_chat_id: community.telegram_chat_id,
      telegram_photo_url: community.telegram_photo_url,
      custom_link: community.custom_link,
      is_group: Boolean(community.is_group),
      subscription_plans: [],
      bot_status: community.bot_status || "unknown",
      is_active: Boolean(community.is_active)
    };

    // Fetch subscription plans for this community
    const { data: plans, error: plansError } = await supabase
      .from('subscription_plans')
      .select('*')
      .eq('community_id', community.id)
      .order('price', { ascending: true });

    if (plansError) {
      console.error("❌ Error fetching subscription plans:", plansError);
    } else if (plans && plans.length > 0) {
      displayCommunity.subscription_plans = plans;
      console.log(`✅ Fetched ${plans.length} subscription plans`);
    }

    return displayCommunity;
  } catch (error) {
    console.error("❌ Error in processCommunityData:", error);
    throw error;
  }
}
