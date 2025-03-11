
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.7";
import { corsHeaders } from "./utils/cors.ts";
import { createSuccessResponse, createErrorResponse, createNotFoundResponse } from "./utils/response.ts";
import { logger } from "./utils/logger.ts";

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
    
    // Log request details
    logger.debug("Request payload:", payload);
    logger.info(`Processing request for ${community_id ? 'community' : 'group'} ID: ${community_id || group_id}`);

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseKey = Deno.env.get("SUPABASE_ANON_KEY") || "";
    
    if (!supabaseUrl || !supabaseKey) {
      logger.error("Missing Supabase credentials");
      return createErrorResponse("Server configuration error");
    }
    
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Determine if we're querying for a community or a group
    if (community_id) {
      // COMMUNITY QUERY
      logger.info(`Fetching community data for ID: ${community_id}`);
      
      // Check if it's a UUID or custom link
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(community_id);
      
      let query = supabase.from("communities").select(`
        id,
        name,
        description,
        telegram_chat_id,
        telegram_invite_link,
        telegram_photo_url,
        subscription_plans (
          id,
          name,
          description,
          price,
          interval,
          features
        )
      `);
      
      if (isUuid) {
        logger.debug(`Querying community by UUID: ${community_id}`);
        query = query.eq("id", community_id);
      } else {
        logger.debug(`Querying community by custom_link: ${community_id}`);
        query = query.eq("custom_link", community_id);
      }
      
      const { data: community, error } = await query.single();
      
      if (error) {
        logger.error(`Error fetching community: ${error.message}`, error);
        return createNotFoundResponse(`Community not found: ${community_id}`);
      }
      
      logger.success(`Successfully fetched community: ${community.name}`);
      
      return createSuccessResponse({
        community
      });
    } 
    else if (group_id) {
      // GROUP QUERY
      logger.info(`Fetching group data for ID: ${group_id}`);
      
      // Get group data
      const { data: group, error: groupError } = await supabase
        .from("community_groups")
        .select(`
          id,
          name,
          description,
          owner_id,
          telegram_chat_id,
          telegram_invite_link,
          communities:group_communities!inner (
            community_id,
            communities (
              id, 
              name,
              description,
              telegram_chat_id,
              telegram_invite_link,
              telegram_photo_url
            )
          )
        `)
        .eq("id", group_id)
        .single();
      
      if (groupError) {
        logger.error(`Error fetching group: ${groupError.message}`, groupError);
        return createNotFoundResponse(`Group not found: ${group_id}`);
      }
      
      // Get subscription plans for the group
      const { data: plans, error: plansError } = await supabase
        .from("subscription_plans")
        .select("*")
        .eq("group_id", group_id);
      
      if (plansError) {
        logger.error(`Error fetching group subscription plans: ${plansError.message}`, plansError);
        // Continue without plans - not fatal
      }
      
      // Process the communities within the group
      const groupCommunities = group.communities.map(item => item.communities).filter(Boolean);
      
      logger.success(`Successfully fetched group: ${group.name} with ${groupCommunities.length} communities`);
      logger.debug(`Group communities:`, groupCommunities);

      // Build response object
      const responseObject = {
        id: group.id,
        name: group.name,
        description: group.description || "Group subscription",
        telegram_chat_id: group.telegram_chat_id,
        telegram_invite_link: group.telegram_invite_link,
        is_group: true,
        communities: groupCommunities,
        subscription_plans: plans || []
      };
      
      return createSuccessResponse({
        community: responseObject
      });
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
