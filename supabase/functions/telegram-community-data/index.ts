
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.7";
import { corsHeaders } from "./utils/cors.ts";
import { createSuccessResponse, createErrorResponse, createNotFoundResponse } from "./utils/response.ts";
import { logger } from "./utils/logger.ts";
import { createSupabaseClient } from "./utils/database.ts";

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get request body
    let payload;
    try {
      payload = await req.json();
    } catch (error) {
      logger.error("Invalid request body", error);
      return createErrorResponse("Invalid request body", error, 400);
    }

    const { community_id, group_id, debug, fetch_telegram_data } = payload || {};
    const idToUse = community_id || group_id;
    
    // Log request details
    logger.debug("Request payload:", payload);
    logger.info(`Processing request for ID: ${idToUse}`);

    // Initialize Supabase client
    let supabase;
    try {
      supabase = createSupabaseClient();
      logger.debug("Supabase client initialized successfully");
    } catch (error) {
      logger.error("Failed to initialize Supabase client:", error);
      return createErrorResponse("Server configuration error: Unable to initialize database connection");
    }
    
    if (idToUse) {
      // Check if this is a UUID or custom link
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(idToUse);
      
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
        logger.debug(`Querying by UUID: ${idToUse}`);
        query = query.eq("id", idToUse);
      } else {
        logger.debug(`Querying by custom_link: ${idToUse}`);
        query = query.eq("custom_link", idToUse);
      }
      
      try {
        const { data: community, error } = await query.maybeSingle();
        
        if (error) {
          logger.error(`Database error fetching community: ${error.message}`, error);
          return createErrorResponse(`Database error: ${error.message}`, error);
        }
        
        if (!community) {
          logger.warn(`No community found for identifier: ${idToUse}`);
          return createNotFoundResponse(`Community not found with identifier: ${idToUse}`);
        }
        
        logger.success(`Successfully fetched: ${community.name} (ID: ${community.id})`);
        
        // Now fetch subscription plans separately for proper filtering
        logger.debug(`Fetching subscription plans for community ID: ${community.id}`);
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
          .eq("community_id", community.id)
          .eq("is_active", true);
          
        if (planError) {
          logger.error(`Error fetching subscription plans: ${planError.message}`, planError);
          // Continue anyway, we'll just return the community without plans
        }
        
        // Perform a direct count query to verify plans exist
        const { count, error: countError } = await supabase
          .from("subscription_plans")
          .select("id", { count: 'exact', head: true })
          .eq("community_id", community.id);
          
        if (countError) {
          logger.error(`Error counting plans: ${countError.message}`);
        } else {
          logger.info(`Total plans in database for community ${community.id}: ${count}`);
        }
        
        // Log raw subscription plans data before processing
        logger.debug(`Raw subscription plans data:`, JSON.stringify(subscriptionPlans || []));
        
        // Add subscription plans to community
        community.subscription_plans = subscriptionPlans || [];
        
        logger.info(`Found ${community.subscription_plans.length} active subscription plans for ${community.name}`);
        
        // Log each plan to verify its structure
        if (community.subscription_plans.length > 0) {
          community.subscription_plans.forEach((plan, index) => {
            logger.debug(`Plan ${index + 1}: ${plan.name} (ID: ${plan.id}), community_id: ${plan.community_id}`);
          });
        } else {
          logger.warn(`No active subscription plans found for community: ${community.name} (ID: ${community.id})`);
          // Double-check with a raw query to see all plans regardless of active status
          const { data: allPlans, error: allPlansError } = await supabase
            .from("subscription_plans")
            .select("id, name, is_active, community_id")
            .eq("community_id", community.id);
            
          if (allPlansError) {
            logger.error(`Error checking all plans: ${allPlansError.message}`);
          } else {
            logger.debug(`All plans (including inactive) for this community:`, JSON.stringify(allPlans || []));
          }
        }
        
        // If this is a group, fetch its member communities
        if (community.is_group) {
          // Get member communities using the updated structure
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
              .eq("community_id", community.id)
              .eq("relationship_type", "group");
            
            if (relationshipsError) {
              logger.error(`Error fetching group relationships: ${relationshipsError.message}`, relationshipsError);
              // Continue anyway, we'll just return the group without members
            } else {
              // Process the communities within the group
              const memberCommunities = relationships
                ?.map(item => item.communities)
                .filter(Boolean) || [];
              
              logger.success(`Group '${community.name}' has ${memberCommunities.length} communities`);
              
              // Add communities to the response
              community.communities = memberCommunities;
            }
          } catch (relError) {
            logger.error(`Unexpected error fetching group relationships: ${relError.message}`, relError);
            // Continue anyway, we'll just return the group without members
          }
        }
        
        // Update community with platform URLs
        community.platform_url = "https://preview--subscribely-serenity.lovable.app";
        community.miniapp_url = "https://preview--subscribely-serenity.lovable.app/telegram-mini-app";
        
        // Log the final response data
        logger.debug(`Final response data:`, JSON.stringify({ community }));
        
        return createSuccessResponse({ community });
      } catch (queryError) {
        logger.error(`Error executing database query: ${queryError.message}`, queryError);
        return createErrorResponse(`Error executing database query: ${queryError.message}`, queryError);
      }
    } 
    else {
      logger.error("Missing required parameter: community_id or group_id");
      return createErrorResponse("Missing required parameter: community_id or group_id", null, 400);
    }
  } catch (error) {
    logger.error("Unexpected error:", error);
    return createErrorResponse("Internal server error", error.message);
  }
});
