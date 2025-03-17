import { supabase } from "@/integrations/supabase/client";
import { Community } from "@/telegram-mini-app/types/community.types";
import { createLogger } from "@/telegram-mini-app/utils/debugUtils";

const logger = createLogger("communityService");

/**
 * Fetches a community by its ID or custom link
 */
export const fetchCommunityByIdOrLink = async (idOrLink: string): Promise<Community | null> => {
  try {
    logger.log(`Fetching community with ID or link: ${idOrLink}`);
    
    // Check if this is a UUID or custom link
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(idOrLink);
    
    // Call the edge function to fetch community data
    const { data, error } = await supabase.functions.invoke("telegram-community-data", {
      body: { 
        community_id: idOrLink,
        debug: true 
      }
    });
    
    if (error) {
      logger.error(`Error invoking edge function: ${error.message}`, error);
      throw new Error(`Failed to load community data: ${error.message}`);
    }
    
    if (!data || !data.community) {
      logger.warn(`No community data returned for identifier: ${idOrLink}`);
      return null;
    }
    
    const community = data.community;
    
    logger.success(`Successfully fetched community: ${community.name}`);
    logger.log(`Has custom_link: ${community.custom_link || 'None'}`);
    logger.log(`Is group: ${community.is_group ? 'Yes' : 'No'}`);
    
    // Process the data for both regular communities and groups
    if (community.is_group) {
      // Format group data
      logger.log(`Processing group data: ${community.name}`);
      
      return {
        id: community.id,
        name: community.name,
        description: community.description || "Group subscription",
        telegram_photo_url: community.telegram_photo_url,
        telegram_chat_id: community.telegram_chat_id,
        telegram_invite_link: community.telegram_invite_link || null,
        custom_link: community.custom_link,
        is_group: true,
        communities: community.communities || [],
        subscription_plans: community.subscription_plans || []
      };
    } else {
      // Return regular community data
      return {
        ...community,
        telegram_invite_link: community.telegram_invite_link || null,
        subscription_plans: community.subscription_plans || []
      };
    }
  } catch (error) {
    logger.error("Error in fetchCommunityByIdOrLink:", error);
    throw error;
  }
};

/**
 * Search communities by name or description
 */
export const searchCommunities = async (query: string): Promise<Community[]> => {
  try {
    logger.log(`Searching communities with query: "${query}"`);
    
    const { data, error } = await supabase
      .from('communities')
      .select(`
        id,
        name,
        description,
        telegram_photo_url,
        telegram_chat_id,
        telegram_invite_link,
        custom_link,
        is_group,
        subscription_plans (
          id,
          name,
          description,
          price,
          interval,
          features,
          is_active,
          created_at,
          updated_at
        )
      `)
      .ilike('name', `%${query}%`)
      .order('name');
      
    if (error) {
      logger.error(`Error searching communities: ${error.message}`);
      throw error;
    }
    
    if (!data || data.length === 0) {
      logger.log(`No communities found for query: "${query}"`);
      return [];
    }
    
    logger.success(`Found ${data.length} communities for query: "${query}"`);
    
    // Process the results to ensure the proper format is returned
    return data.map(community => ({
      id: community.id,
      name: community.name,
      description: community.description,
      telegram_photo_url: community.telegram_photo_url,
      telegram_chat_id: community.telegram_chat_id,
      telegram_invite_link: community.telegram_invite_link || null,
      custom_link: community.custom_link,
      is_group: community.is_group,
      subscription_plans: community.subscription_plans || []
    }));
  } catch (error) {
    logger.error(`Error in searchCommunities:`, error);
    return [];
  }
};
