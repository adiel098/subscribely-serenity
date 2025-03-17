
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
    logger.log(`Has ${community.subscription_plans?.length || 0} subscription plans`);
    
    // Log subscription plan details for debugging
    if (community.subscription_plans && community.subscription_plans.length > 0) {
      logger.log(`Subscription plans details:`);
      community.subscription_plans.forEach((plan, index) => {
        logger.log(`Plan ${index + 1}: ${plan.name} (${plan.id}) - Active: ${plan.is_active}`);
      });
    } else {
      logger.warn(`No subscription plans found for community: ${community.name}`);
    }
    
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
        custom_link: community.custom_link,
        is_group: true,
        communities: community.communities || [],
        subscription_plans: (community.subscription_plans || []).map(plan => ({
          ...plan,
          created_at: plan.created_at || new Date().toISOString(),
          updated_at: plan.updated_at || new Date().toISOString()
        }))
      };
    } else {
      // Return regular community data
      return {
        ...community,
        subscription_plans: (community.subscription_plans || []).map(plan => ({
          ...plan,
          created_at: plan.created_at || new Date().toISOString(),
          updated_at: plan.updated_at || new Date().toISOString()
        }))
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
    
    // Process the results and ensure all required fields are present
    return data.map(community => {
      const activePlans = community.subscription_plans 
        ? community.subscription_plans
            .filter(plan => plan.is_active)
            .map(plan => ({
              ...plan,
              created_at: plan.created_at || new Date().toISOString(),
              updated_at: plan.updated_at || new Date().toISOString()
            }))
        : [];
        
      return {
        id: community.id,
        name: community.name,
        description: community.description,
        telegram_photo_url: community.telegram_photo_url,
        telegram_chat_id: community.telegram_chat_id,
        custom_link: community.custom_link,
        is_group: community.is_group,
        subscription_plans: activePlans
      };
    });
  } catch (error) {
    logger.error(`Error in searchCommunities:`, error);
    return [];
  }
};
