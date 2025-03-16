
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
    const idToUse = community_id || group_id;
    
    // Log request details
    logger.debug("Request payload:", payload);
    logger.info(`Processing request for ID: ${idToUse}`);

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseKey = Deno.env.get("SUPABASE_ANON_KEY") || "";
    
    if (!supabaseUrl || !supabaseKey) {
      logger.error("Missing Supabase credentials");
      return createErrorResponse("Server configuration error");
    }
    
    const supabase = createClient(supabaseUrl, supabaseKey);

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
        logger.debug(`Querying by UUID: ${idToUse}`);
        query = query.eq("id", idToUse);
      } else {
        logger.debug(`Querying by custom_link: ${idToUse}`);
        query = query.eq("custom_link", idToUse);
      }
      
      const { data: community, error } = await query.single();
      
      if (error) {
        logger.error(`Error fetching by ID/link "${idToUse}": ${error.message}`, error);
        return createNotFoundResponse(`Community not found with identifier: ${idToUse}`);
      }
      
      logger.success(`Successfully fetched: ${community.name} (ID: ${community.id})`);
      
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
              telegram_photo_url,
              custom_link
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
      logger.error("Missing required parameter: community_id or group_id");
      return createErrorResponse("Missing required parameter: community_id or group_id", null, 400);
    }
  } catch (error) {
    logger.error("Unexpected error:", error);
    return createErrorResponse("Internal server error", error.message);
  }
});
