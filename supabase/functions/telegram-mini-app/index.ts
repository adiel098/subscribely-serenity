
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.7";
import { corsHeaders } from "./utils/corsHeaders.ts";
import { extractInitData } from "./utils/dataExtractor.ts";
import { RequestBody } from "./utils/telegramTypes.ts";
import { fetchCommunityData, processCommunityData } from "./services/communityService.ts";
import { processUserData } from "./services/userService.ts";
import { createErrorResponse } from "./services/errorHandler.ts";

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Extract request body with safety checks
    let body: RequestBody;
    try {
      body = await req.json();
    } catch (error) {
      console.error("Error parsing request body:", error);
      return new Response(
        JSON.stringify({
          error: "Invalid request body",
          details: error.message,
        }),
        { headers: corsHeaders, status: 400 }
      );
    }

    const { start, initData } = body || {};
    console.log("Request payload:", { start, initData });

    if (!start) {
      return new Response(
        JSON.stringify({
          error: "Missing start parameter",
        }),
        { headers: corsHeaders, status: 400 }
      );
    }

    // Fetch community or group data based on the start parameter
    const { communityQuery, isGroupRequest, entityId } = await fetchCommunityData(supabase, start);
    const { data, error } = await communityQuery;

    if (error) {
      console.error(`❌ Error fetching ${isGroupRequest ? 'group' : 'community'} with ID "${entityId}":`, error);
      console.error("Error details:", error.message, error.details);
      
      return new Response(
        JSON.stringify({
          error: `Failed to fetch ${isGroupRequest ? 'group' : 'community'} data`,
          details: error.message,
          param: start,
          isGroupRequest
        }),
        { headers: corsHeaders, status: 500 }
      );
    }

    // Process the community data
    const displayCommunity = await processCommunityData(supabase, data, isGroupRequest);

    // Process Telegram Mini App init data if provided
    let userData = null;
    if (initData) {
      try {
        const parsedInitData = extractInitData(initData);
        console.log("Parsed initData:", parsedInitData);

        if (parsedInitData.user) {
          const telegramUser = parsedInitData.user;
          // Set appropriate IDs based on request type
          const communityId = isGroupRequest ? null : displayCommunity.id;
          const groupId = isGroupRequest ? displayCommunity.id : null;
          
          userData = await processUserData(supabase, telegramUser, communityId, groupId);
        }
      } catch (error) {
        console.error("Error processing initData:", error);
        // Don't fail the request, just log the error and continue
      }
    }
    
    console.log("Final userData being returned:", userData);
    console.log("Final community data being returned:", JSON.stringify(displayCommunity, null, 2));

    return new Response(
      JSON.stringify({
        community: displayCommunity,
        user: userData,
      }),
      { headers: corsHeaders }
    );
  } catch (error) {
    return createErrorResponse(error);
  }
});
