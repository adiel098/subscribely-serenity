
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
    
    // Build the query based on whether we have a UUID or custom link
    let query = supabase.from("communities").select(`
      id,
      name,
      description,
      telegram_photo_url,
      telegram_chat_id,
      telegram_invite_link,
      custom_link,
      is_group,
      community_relationships:community_relationships!parent_community_id(
        community_id,
        communities:community_id(
          id, 
          name,
          description,
          telegram_photo_url,
          telegram_chat_id,
          telegram_invite_link,
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
        created_at,
        updated_at
      )
    `);
    
    if (isUUID) {
      logger.log(`Querying by UUID: ${idOrLink}`);
      query = query.eq("id", idOrLink);
    } else {
      logger.log(`Querying by custom link: ${idOrLink}`);
      query = query.eq("custom_link", idOrLink);
    }
    
    const { data, error } = await query.maybeSingle();
    
    if (error) {
      logger.error(`Error fetching community: ${error.message}`);
      throw error;
    }
    
    if (!data) {
      logger.warn(`No community found for identifier: ${idOrLink}`);
      return null;
    }
    
    logger.success(`Successfully fetched community: ${data.name}`);
    
    // Process the data for both regular communities and groups
    if (data.is_group) {
      // Format group data
      logger.log(`Processing group data: ${data.name}`);
      
      // Extract member communities from relationships
      const memberCommunities = [];
      if (data.community_relationships && Array.isArray(data.community_relationships)) {
        for (const rel of data.community_relationships) {
          if (rel.communities) {
            memberCommunities.push(rel.communities);
          }
        }
      }
      
      logger.log(`Group has ${memberCommunities.length} communities`);
      
      return {
        id: data.id,
        name: data.name,
        description: data.description || "Group subscription",
        telegram_photo_url: data.telegram_photo_url,
        telegram_chat_id: data.telegram_chat_id,
        telegram_invite_link: data.telegram_invite_link || null,
        custom_link: data.custom_link,
        is_group: true,
        communities: memberCommunities,
        subscription_plans: data.subscription_plans || []
      };
    } else {
      // Return regular community data
      return {
        ...data,
        telegram_invite_link: data.telegram_invite_link || null,
        subscription_plans: data.subscription_plans || []
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
