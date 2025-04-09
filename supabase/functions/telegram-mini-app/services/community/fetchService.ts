
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.7";

/**
 * Fetch community data based on a given identifier (ID or custom link)
 */
export async function fetchCommunityData(
  supabase: ReturnType<typeof createClient>,
  identifier: string
) {
  // First, determine if this is a UUID, custom link, or a group prefix
  const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(identifier);
  const isGroupPrefix = identifier.startsWith('group_');
  
  // Extract group ID if it's a group reference
  let entityId = identifier;
  if (isGroupPrefix) {
    entityId = identifier.replace('group_', '');
    console.log(`🔎 Group prefix detected, extracting group ID: ${entityId}`);
  }
  
  let communityQuery;
  
  if (isUUID || isGroupPrefix) {
    console.log(`🔍 Looking up community by ID: ${entityId}`);
    communityQuery = supabase
      .from('communities')
      .select(`
        id, 
        name,
        description,
        owner_id,
        telegram_chat_id,
        custom_link,
        telegram_photo_url,
        is_group,
        subscription_plans(
          id, 
          name, 
          description, 
          price, 
          interval, 
          features, 
          is_active
        )
      `)
      .eq('id', entityId)
      .single();
      
  } else {
    console.log(`🔍 Looking up community by custom link: ${identifier}`);
    communityQuery = supabase
      .from('communities')
      .select(`
        id, 
        name,
        description,
        owner_id,
        telegram_chat_id,
        custom_link,
        telegram_photo_url,
        is_group,
        subscription_plans(
          id, 
          name, 
          description, 
          price, 
          interval, 
          features, 
          is_active
        )
      `)
      .eq('custom_link', identifier)
      .single();
  }
  
  // Return both the query and the actual ID we're using
  return { communityQuery, entityId };
}
