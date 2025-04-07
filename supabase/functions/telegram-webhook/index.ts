import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.7";
import { corsHeaders } from "./utils/corsHeaders.ts";
import { handleNowPaymentsIPN } from "./handlers/nowpaymentsHandler.ts";
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

    // Extract request body
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

    // Check if this is a NOWPayments IPN callback
    const isNowPaymentsIPN = req.headers.get('x-nowpayments-sig') || 
                           (body && body.payment_id && body.payment_status);
    
    if (isNowPaymentsIPN) {
      console.log("Detected NOWPayments IPN callback");
      const result = await handleNowPaymentsIPN(supabase, body);
      
      return new Response(
        JSON.stringify(result),
        { headers: corsHeaders, status: result.success ? 200 : 400 }
      );
    }
    
    // Extract start parameter from body or URL
    let start = body?.start || null;
    
    // If start is not in the body, try to get it from URL query parameters
    if (!start) {
      const url = new URL(req.url);
      start = url.searchParams.get("start");
      console.log("Extracted start parameter from URL:", start);
    }
    
    const initData = body?.initData;
    console.log("Request payload:", { start, initData, url: req.url });

    if (!start) {
      return new Response(
        JSON.stringify({
          error: "Missing start parameter",
          details: "No community identifier provided in the request",
          requestUrl: req.url
        }),
        { headers: corsHeaders, status: 400 }
      );
    }

    // Fetch community or group data based on the start parameter
    const { communityQuery, entityId } = await fetchCommunityData(supabase, start);
    const { data, error } = await communityQuery;

    if (error) {
      console.error(`❌ Error fetching entity with identifier "${entityId}":`, error);
      console.error("Error details:", error.message, error.details);
      
      return new Response(
        JSON.stringify({
          error: `Failed to fetch community data`,
          details: error.message,
          param: start,
          requestUrl: req.url
        }),
        { headers: corsHeaders, status: 500 }
      );
    }

    // Process the community data
    const displayCommunity = await processCommunityData(supabase, data);

    // Process Telegram Mini App init data if provided
    let userData = null;
    if (initData) {
      try {
        const parsedInitData = extractInitData(initData);
        console.log("Parsed initData:", parsedInitData);

        if (parsedInitData.user) {
          const telegramUser = parsedInitData.user;
          // Set appropriate IDs based on community type
          const communityId = displayCommunity.is_group ? null : displayCommunity.id;
          const groupId = displayCommunity.is_group ? displayCommunity.id : null;
          
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
    console.error("Error processing webhook:", error);
    
    return new Response(
      JSON.stringify({
        error: "Internal server error",
        details: error.message,
      }),
      { headers: corsHeaders, status: 500 }
    );
  }
});
