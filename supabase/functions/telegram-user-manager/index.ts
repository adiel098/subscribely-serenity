
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { handleGetSubscriptions } from "./handlers/subscriptionHandler.ts";
import { handleCancelSubscription } from "./handlers/subscriptionHandler.ts";
import { handleCreateOrUpdateMember } from "./handlers/memberHandler.ts";
import { handleSearchCommunities } from "./handlers/searchHandler.ts";
import { corsHeaders } from "./utils/cors.ts";

// Create a Supabase client with the auth admin role
const supabaseAdmin = createClient(
  Deno.env.get("SUPABASE_URL") ?? "",
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
  { auth: { persistSession: false } }
);

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Parse request body
    const requestData = await req.json();
    console.log(`[telegram-user-manager] Received request with action: ${requestData.action}`);
    console.log(`[telegram-user-manager] Request data:`, JSON.stringify(requestData, null, 2));

    // Process based on action
    switch (requestData.action) {
      case "get_subscriptions":
        return jsonResponse(await handleGetSubscriptions(supabaseAdmin, requestData));

      case "cancel_subscription":
        return jsonResponse(await handleCancelSubscription(supabaseAdmin, requestData));

      case "create_or_update_member":
        console.log(`[telegram-user-manager] Starting create_or_update_member`);
        return jsonResponse(await handleCreateOrUpdateMember(supabaseAdmin, requestData));
        
      case "search_communities":
        console.log(`[telegram-user-manager] Starting search_communities`);
        return jsonResponse(await handleSearchCommunities(supabaseAdmin, requestData));

      default:
        return jsonResponse({ error: "Invalid action" }, 400);
    }
  } catch (error) {
    console.error(`[telegram-user-manager] Error processing request:`, error);
    return jsonResponse({ error: error.message }, 500);
  }
});

function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json",
    },
  });
}
