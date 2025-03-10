
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
