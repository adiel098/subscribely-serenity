
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';
import { corsHeaders } from "./utils/cors.ts";
import { logger } from "./utils/logger.ts";
import { fetchCommunityData, updateCommunityDescription, fetchCommunityPaymentMethods } from "./utils/database.ts";
import { fetchTelegramChannelInfo, testPhotoUrl } from "./utils/telegram.ts";
import { createSuccessResponse, createErrorResponse, createNotFoundResponse } from "./utils/response.ts";

console.log("Telegram Community Data function started");

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
    const supabase = createClient(supabaseUrl, supabaseKey);

    const requestData = await req.json();
    const { community_id, debug = true, fetch_telegram_data = false } = requestData;

    logger.debug(`Received request with community_id: ${community_id}`);
    logger.debug(`Full request data:`, requestData);

    if (!community_id) {
      logger.error("Missing community_id parameter");
      return createErrorResponse("Missing community_id parameter", null, 400);
    }

    // Check if community_id is a UUID or a custom link
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(community_id);
    
    // Fetch community data
    const { data: community, error } = await fetchCommunityData(supabase, {
      communityId: community_id,
      isUUID
    });

    if (error) {
      logger.error(`Database error fetching community ${community_id}:`, error);
      return createErrorResponse(
        `Error fetching community: ${error.message}`,
        { details: error.details, isUUID, param: community_id }
      );
    }

    if (!community) {
      logger.error(`Community with ${isUUID ? 'ID' : 'custom link'} "${community_id}" not found`);
      return createNotFoundResponse("Community not found", { param: community_id, isUUID });
    }

    logger.success(`Retrieved community from database:`, community);
    logger.debug(`Photo URL in database: ${community.telegram_photo_url || 'Not set'}`);
    logger.debug(`Telegram chat ID: ${community.telegram_chat_id || 'Not set'}`);
    logger.debug(`Custom link: ${community.custom_link || 'Not set'}`);
    logger.debug(`Community description: "${community.description || 'NOT SET'}" (type: ${typeof community.description})`);
    
    // Fetch Telegram channel info if requested and chat_id is available
    if (fetch_telegram_data && community.telegram_chat_id) {
      try {
        const botToken = Deno.env.get("TELEGRAM_BOT_TOKEN");
        
        if (botToken) {
          const telegramData = await fetchTelegramChannelInfo(botToken, community.telegram_chat_id);
          
          if (telegramData.ok) {
            const chatInfo = telegramData.result;
            const telegramDescription = chatInfo.description;
            
            logger.debug(`Channel description from Telegram: "${telegramDescription || 'NOT SET'}"`);
            
            // If the description from Telegram is different from the one in the database, update it
            if (telegramDescription && telegramDescription !== community.description) {
              const { error: updateError } = await updateCommunityDescription(
                supabase, 
                community.id, 
                telegramDescription
              );
              
              if (updateError) {
                logger.error(`Error updating community description: ${updateError.message}`);
              } else {
                logger.success(`Successfully updated community description`);
                // Update the description in the response
                community.description = telegramDescription;
              }
            }
          } else {
            logger.error(`Telegram API error: ${telegramData.description}`);
          }
        }
      } catch (telegramError) {
        logger.error("Error fetching Telegram channel info:", telegramError);
      }
    }
    
    if (debug) {
      logger.debug(`Found community: ${community.name} (ID: ${community.id})`);
      logger.debug(`Telegram chat ID: ${community.telegram_chat_id || 'Not set'}`);
      
      // Log subscription plans details
      if (community.subscription_plans) {
        logger.debug(`Community has ${community.subscription_plans.length} subscription plans`);
        community.subscription_plans.forEach((plan: any, i: number) => {
          logger.debug(`   - Plan ${i + 1}: ${plan.name}, $${plan.price}/${plan.interval}`);
          logger.debug(`     Description: ${plan.description || 'None'}`);
          logger.debug(`     Features: ${JSON.stringify(plan.features || [])}`);
          logger.debug(`     Is active: ${plan.is_active}`);
        });
      } else {
        logger.error(`subscription_plans is undefined or null for this community`);
      }
      
      // Check payment methods for this community
      const { data: paymentMethods, error: pmError } = await fetchCommunityPaymentMethods(supabase, community.id);
        
      if (pmError) {
        logger.error(`Error fetching payment methods:`, pmError);
      } else {
        logger.debug(`Community has ${paymentMethods?.length || 0} payment methods`);
        paymentMethods?.forEach((pm: any, i: number) => {
          logger.debug(`   - Payment method ${i + 1}: ${pm.provider} (Active: ${pm.is_active})`);
        });
      }
    }

    // Ensure subscription_plans is always an array
    if (!community.subscription_plans) {
      logger.warn(`subscription_plans is null/undefined for community ${community_id} - setting to empty array`);
      community.subscription_plans = [];
    }

    // Extra debugging for photo URL
    if (community.telegram_photo_url) {
      logger.debug(`Community has a photo URL: ${community.telegram_photo_url}`);
      const isPhotoAccessible = await testPhotoUrl(community.telegram_photo_url);
      if (!isPhotoAccessible) {
        logger.error(`Photo URL might be invalid or inaccessible`);
      }
    } else {
      logger.debug(`Community does NOT have a photo URL stored in the database`);
      logger.debug(`Checking if we should fetch a photo using telegram_chat_id: ${community.telegram_chat_id || 'Not available'}`);
    }

    logger.debug(`Returning response with community data`);
    logger.debug(`Final community data returned:`, community);
    
    return createSuccessResponse({ community });

  } catch (error) {
    logger.error("Uncaught error in telegram-community-data function:", error);
    return createErrorResponse(error.message);
  }
});
