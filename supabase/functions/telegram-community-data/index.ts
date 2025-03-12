
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

    const { community_id, debug, fetch_telegram_data } = payload || {};
    
    // Log request details
    logger.debug("Request payload:", payload);
    logger.info(`Processing request for community ID: ${community_id}`);

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseKey = Deno.env.get("SUPABASE_ANON_KEY") || "";
    
    if (!supabaseUrl || !supabaseKey) {
      logger.error("Missing Supabase credentials");
      return createErrorResponse("Server configuration error");
    }
    
    const supabase = createClient(supabaseUrl, supabaseKey);

    if (community_id) {
      // Check if it's a UUID or custom link
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(community_id);
      
      let query = supabase.from("communities").select(`
        id,
        name,
        description,
        telegram_chat_id,
        telegram_invite_link,
        telegram_photo_url,
        is_group,
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
      
      // If this is a group, fetch its member communities
      if (community.is_group) {
        // Get member communities
        const { data: relationships, error: relationshipsError } = await supabase
          .from("community_relationships")
          .select(`
            member_id,
            communities:member_id (
              id, 
              name,
              description,
              telegram_chat_id,
              telegram_invite_link,
              telegram_photo_url
            )
          `)
          .eq("community_id", community.id)
          .eq("relationship_type", "group");
        
        if (relationshipsError) {
          logger.error(`Error fetching group relationships: ${relationshipsError.message}`, relationshipsError);
        } else {
          // Process the communities within the group
          const memberCommunities = relationships
            ?.map(item => item.communities)
            .filter(Boolean) || [];
          
          logger.success(`Successfully fetched group: ${community.name} with ${memberCommunities.length} communities`);
          
          // Add communities to the response
          community.communities = memberCommunities;
        }
      }
      
      return createSuccessResponse({ community });
    } 
    else {
      logger.error("Missing required parameter: community_id");
      return createErrorResponse("Missing required parameter: community_id", null, 400);
    }
  } catch (error) {
    logger.error("Unexpected error:", error);
    return createErrorResponse("Internal server error", error.message);
  }
});
