
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.7";
import { logger } from '../utils/logger.ts';
import { createSupabaseClient } from '../utils/database.ts';
import { fetchTelegramChannelInfo, testPhotoUrl } from '../utils/telegram.ts';

/**
 * Fetch community data by ID or custom link
 */
export async function fetchCommunityById(idToUse: string, isUuid: boolean) {
  logger.debug(`Querying community with ${isUuid ? 'UUID' : 'custom_link'}: ${idToUse}`);
  
  // Initialize Supabase client
  const supabase = createSupabaseClient();
  
  let query = supabase.from("communities").select(`
    id,
    name,
    description,
    telegram_chat_id,
    telegram_photo_url,
    custom_link,
    is_group
  `);
  
  if (isUuid) {
    query = query.eq("id", idToUse);
  } else {
    query = query.eq("custom_link", idToUse);
  }
  
  const { data: community, error } = await query.maybeSingle();
  
  if (error) {
    logger.error(`Database error fetching community: ${error.message}`, error);
    throw new Error(`Database error: ${error.message}`);
  }
  
  if (!community) {
    logger.warn(`No community found for identifier: ${idToUse}`);
    return null;
  }
  
  logger.success(`Successfully fetched: ${community.name} (ID: ${community.id})`);
  return community;
}

/**
 * Fetch subscription plans for a community
 */
export async function fetchSubscriptionPlans(supabase: ReturnType<typeof createClient>, communityId: string) {
  logger.debug(`Fetching subscription plans for community ID: ${communityId}`);
  
  const { data: subscriptionPlans, error: planError } = await supabase
    .from("subscription_plans")
    .select(`
      id, 
      name, 
      description, 
      price, 
      interval, 
      features, 
      is_active, 
      community_id, 
      created_at, 
      updated_at
    `)
    .eq("community_id", communityId)
    .eq("is_active", true);
    
  if (planError) {
    logger.error(`Error fetching subscription plans: ${planError.message}`, planError);
    // Continue anyway, we'll just return an empty array
    return [];
  }
  
  logger.debug(`Raw subscription plans data:`, JSON.stringify(subscriptionPlans || []));
  logger.info(`Found ${subscriptionPlans?.length || 0} active subscription plans`);
  
  return subscriptionPlans || [];
}

/**
 * Verify plans exist with a count query
 */
export async function verifyPlansCount(supabase: ReturnType<typeof createClient>, communityId: string) {
  const { count, error: countError } = await supabase
    .from("subscription_plans")
    .select("id", { count: 'exact', head: true })
    .eq("community_id", communityId);
    
  if (countError) {
    logger.error(`Error counting plans: ${countError.message}`);
  } else {
    logger.info(`Total plans in database for community ${communityId}: ${count}`);
  }
  
  return count || 0;
}

/**
 * Fetch member communities of a group
 */
export async function fetchGroupMemberCommunities(supabase: ReturnType<typeof createClient>, groupId: string) {
  try {
    const { data: relationships, error: relationshipsError } = await supabase
      .from("community_relationships")
      .select(`
        member_id,
        communities:member_id (
          id, 
          name,
          description,
          telegram_chat_id,
          telegram_photo_url,
          custom_link
        )
      `)
      .eq("community_id", groupId)
      .eq("relationship_type", "group");
    
    if (relationshipsError) {
      logger.error(`Error fetching group relationships: ${relationshipsError.message}`, relationshipsError);
      return [];
    }
    
    // Process the communities within the group
    const memberCommunities = relationships
      ?.map(item => item.communities)
      .filter(Boolean) || [];
    
    logger.success(`Group has ${memberCommunities.length} communities`);
    return memberCommunities;
  } catch (relError) {
    logger.error(`Unexpected error fetching group relationships: ${relError.message}`, relError);
    return [];
  }
}
