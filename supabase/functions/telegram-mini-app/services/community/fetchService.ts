
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
