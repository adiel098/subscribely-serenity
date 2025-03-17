
import { supabase } from "@/integrations/supabase/client";
import { Community } from "@/telegram-mini-app/types/community.types";
import { createLogger } from "@/telegram-mini-app/utils/debugUtils";
import { debugPlans, ensurePlanFields, verifyPlansInDatabase, deepVerifyPlans } from "@/telegram-mini-app/utils/planDebugUtils";
import { invokeSupabaseFunction } from "./utils/serviceUtils";
import { PLATFORM_BASE_URL, TELEGRAM_MINI_APP_URL } from "@/telegram-mini-app/utils/config";

const logger = createLogger("communityService");

/**
 * Fetches a community by its ID or custom link
 */
export const fetchCommunityByIdOrLink = async (idOrLink: string): Promise<Community | null> => {
  try {
    logger.log(`Fetching community with ID or link: ${idOrLink}`);
    
    // Check if this is a UUID or custom link
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(idOrLink);
    logger.debug(`Parameter type: ${isUUID ? "UUID" : "Custom link"}, Value: "${idOrLink}"`);
    
    // If it's a UUID, perform extended verification
    if (isUUID) {
      logger.debug(`Running extended verification for UUID ${idOrLink}...`);
      
      // First verify plans exist in the database directly
      await verifyPlansInDatabase(idOrLink, supabase);
      
      // Then do a deep verification across multiple access methods
      await deepVerifyPlans(idOrLink, supabase);
    }
    
    // Call the edge function to fetch community data
    logger.debug(`Invoking edge function telegram-community-data with payload:`, { community_id: idOrLink, debug: true });
    const { data, error } = await invokeSupabaseFunction("telegram-community-data", {
      community_id: idOrLink,
      debug: true
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
    
    logger.success(`Successfully fetched community: ${community.name} (ID: ${community.id})`);
    logger.log(`Has custom_link: ${community.custom_link || 'None'}`);
    logger.log(`Is group: ${community.is_group ? 'Yes' : 'No'}`);
    
    // Log subscription plans data in detail
    if (community.subscription_plans) {
      logger.debug('Raw subscription plans received from edge function:', JSON.stringify(community.subscription_plans));
      logger.log(`Received ${community.subscription_plans.length} subscription plans`);
      
      // Detailed logging of each plan
      community.subscription_plans.forEach((plan, index) => {
        logger.debug(`Plan ${index + 1} details:`, {
          id: plan.id,
          name: plan.name,
          community_id: plan.community_id || 'MISSING',
          price: plan.price,
          interval: plan.interval,
          is_active: plan.is_active
        });
      });
      
      // Check for missing community_id in plans
      const missingCommunityIdPlans = community.subscription_plans.filter(p => !p.community_id);
      if (missingCommunityIdPlans.length > 0) {
        logger.warn(`Found ${missingCommunityIdPlans.length} plans with missing community_id!`);
        logger.debug('Plans with missing community_id:', JSON.stringify(missingCommunityIdPlans));
      }
      
      // Debug the plans to find any issues
      debugPlans(community.subscription_plans);
      
      // Ensure all plans have required fields to prevent frontend issues
      logger.debug('Ensuring all plans have required fields...');
      community.subscription_plans = ensurePlanFields(community.subscription_plans);
      
      // Verify the final result
      logger.debug(`Final plans count after processing: ${community.subscription_plans.length}`);
      if (community.subscription_plans.length > 0) {
        logger.debug(`First processed plan:`, community.subscription_plans[0]);
      }
      
      // Log each plan's community_id to verify it's properly set
      community.subscription_plans.forEach((plan, index) => {
        logger.debug(`Plan ${index + 1} (${plan.name}) community_id: ${plan.community_id || 'MISSING'}`);
        if (!plan.community_id) {
          logger.warn(`Plan ${plan.name} has missing community_id! Setting to community.id: ${community.id}`);
          plan.community_id = community.id;
        }
        else if (plan.community_id !== community.id) {
          logger.warn(`Plan ${plan.name} has mismatched community_id: ${plan.community_id} vs ${community.id}`);
        }
      });
    } else {
      logger.warn(`No subscription plans received for community: ${community.name} (ID: ${community.id})`);
      
      // Make a direct query to check if plans exist in the database
      try {
        logger.debug(`Making direct query to check for plans for community ID: ${community.id}`);
        const { data: directPlans, error: directError } = await supabase
          .from('subscription_plans')
          .select('id, name, community_id, is_active')
          .eq('community_id', community.id);
          
        if (directError) {
          logger.error(`Error in direct plans query: ${directError.message}`);
        } else {
          logger.debug(`Direct query found ${directPlans?.length || 0} plans:`, JSON.stringify(directPlans || []));
          
          if (directPlans && directPlans.length > 0) {
            const activePlans = directPlans.filter(p => p.is_active);
            logger.warn(`Direct query found ${activePlans.length} active plans but edge function returned none!`);
            
            // Use the direct query results if edge function failed to return plans
            logger.info(`Using direct query results for subscription plans`);
            community.subscription_plans = ensurePlanFields(directPlans);
          }
        }
      } catch (directQueryError) {
        logger.error(`Error in direct plans query:`, directQueryError);
      }
      
      // Initialize empty array if still not set to prevent null reference errors
      if (!community.subscription_plans) {
        logger.warn(`Initializing empty subscription_plans array as fallback`);
        community.subscription_plans = [];
      }
    }
    
    // Ensure the platform and mini app URLs are correctly set
    community.platform_url = community.platform_url || PLATFORM_BASE_URL;
    community.miniapp_url = community.miniapp_url || TELEGRAM_MINI_APP_URL;
    
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
        platform_url: community.platform_url,
        miniapp_url: community.miniapp_url,
        is_group: true,
        communities: community.communities || [],
        subscription_plans: community.subscription_plans || []
      };
    } else {
      // Return regular community data
      logger.debug(`Final community data being returned:`, JSON.stringify({
        id: community.id,
        name: community.name,
        subscription_plans_count: community.subscription_plans?.length || 0
      }));
      
      return {
        ...community,
        platform_url: community.platform_url,
        miniapp_url: community.miniapp_url,
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
          updated_at,
          community_id
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
      // Filter for active plans only
      const activePlans = community.subscription_plans 
        ? ensurePlanFields(community.subscription_plans.filter(plan => plan.is_active))
        : [];
        
      return {
        id: community.id,
        name: community.name,
        description: community.description,
        telegram_photo_url: community.telegram_photo_url,
        telegram_chat_id: community.telegram_chat_id,
        custom_link: community.custom_link,
        is_group: community.is_group,
        platform_url: PLATFORM_BASE_URL,
        miniapp_url: TELEGRAM_MINI_APP_URL,
        subscription_plans: activePlans
      };
    });
  } catch (error) {
    logger.error(`Error in searchCommunities:`, error);
    return [];
  }
};
