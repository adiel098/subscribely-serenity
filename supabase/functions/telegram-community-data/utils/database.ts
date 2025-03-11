
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';
import { logger } from './logger.ts';

type CommunityQueryParams = {
  communityId: string;
  isUUID: boolean;
};

/**
 * Fetch community data by ID or custom link
 */
export async function fetchCommunityData(
  supabase: ReturnType<typeof createClient>,
  params: CommunityQueryParams
) {
  const { communityId, isUUID } = params;
  
  logger.debug(`Fetching community data for ${isUUID ? 'ID' : 'custom link'}: ${communityId}`);
  
  let communityQuery;
  
  if (isUUID) {
    logger.debug(`Parameter is a UUID, searching by ID: ${communityId}`);
    communityQuery = supabase
      .from('communities')
      .select(`
        id, 
        name, 
        description, 
        telegram_photo_url, 
        telegram_invite_link,
        telegram_chat_id,
        member_count,
        subscription_count,
        custom_link,
        subscription_plans(*)
      `)
      .eq('id', communityId)
      .single();
  } else {
    logger.debug(`Parameter appears to be a custom link: "${communityId}"`);
    communityQuery = supabase
      .from('communities')
      .select(`
        id, 
        name, 
        description, 
        telegram_photo_url, 
        telegram_invite_link,
        telegram_chat_id,
        member_count,
        subscription_count,
        custom_link,
        subscription_plans(*)
      `)
      .eq('custom_link', communityId)
      .single();
  }

  logger.debug(`Executing database query for community ${isUUID ? 'ID' : 'custom link'}: ${communityId}`);
  return await communityQuery;
}

/**
 * Fetch group data by ID or custom link
 */
export async function fetchGroupData(
  supabase: ReturnType<typeof createClient>,
  groupId: string,
  isUUID: boolean
) {
  logger.debug(`Fetching group data for ${isUUID ? 'ID' : 'custom link'}: ${groupId}`);
  
  let groupQuery;
  
  if (isUUID) {
    logger.debug(`Parameter is a UUID, searching by ID: ${groupId}`);
    groupQuery = supabase
      .from('community_groups')
      .select('*')
      .eq('id', groupId)
      .single();
  } else {
    logger.debug(`Parameter appears to be a custom link: "${groupId}"`);
    groupQuery = supabase
      .from('community_groups')
      .select('*')
      .eq('custom_link', groupId)
      .single();
  }

  logger.debug(`Executing database query for group ${isUUID ? 'ID' : 'custom link'}: ${groupId}`);
  return await groupQuery;
}

/**
 * Update community description in the database
 */
export async function updateCommunityDescription(
  supabase: ReturnType<typeof createClient>,
  communityId: string,
  description: string
) {
  logger.debug(`Updating description for community ${communityId} in database`);
  
  return await supabase
    .from('communities')
    .update({ description })
    .eq('id', communityId);
}

/**
 * Fetch payment methods for a community
 */
export async function fetchCommunityPaymentMethods(
  supabase: ReturnType<typeof createClient>,
  communityId: string
) {
  logger.debug(`Fetching payment methods for community ${communityId}`);
  
  return await supabase
    .from('payment_methods')
    .select('id, provider, is_active')
    .eq('community_id', communityId);
}

/**
 * Fetch community group members
 */
export async function fetchGroupMembers(
  supabase: ReturnType<typeof createClient>,
  groupId: string
) {
  logger.debug(`Fetching members for group ${groupId}`);
  
  return await supabase
    .from('community_group_members')
    .select('community_id')
    .eq('group_id', groupId)
    .order('display_order', { ascending: true });
}

/**
 * Fetch communities by IDs
 */
export async function fetchCommunitiesByIds(
  supabase: ReturnType<typeof createClient>,
  communityIds: string[]
) {
  logger.debug(`Fetching ${communityIds.length} communities by IDs`);
  
  return await supabase
    .from('communities')
    .select('*')
    .in('id', communityIds);
}

/**
 * Fetch subscription plans for multiple communities
 */
export async function fetchSubscriptionPlansForCommunities(
  supabase: ReturnType<typeof createClient>,
  communityIds: string[]
) {
  logger.debug(`Fetching subscription plans for ${communityIds.length} communities`);
  
  return await supabase
    .from('subscription_plans')
    .select('*')
    .in('community_id', communityIds)
    .eq('is_active', true);
}
