
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.43.2";
import { corsHeaders } from "./cors.ts";
import { processMember } from "./memberProcessor.ts";

serve(async (req) => {
  // Handle CORS preflight request
  if (req.method === "OPTIONS") {
    return new Response("OK", { headers: corsHeaders });
  }

  try {
    // Create a Supabase client with the service role key
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log("Starting subscription check process...");

    // Use RPC to call the PostgreSQL function
    const { data: membersToCheck, error: memberError } = await supabase.rpc(
      "get_members_to_check_v2" // Using the new function version with proper string comparisons
    );

    if (memberError) {
      console.error("Error getting members to check:", memberError);
      throw memberError;
    }

    console.log(`Found ${membersToCheck?.length || 0} members to process`);

    // Process each member
    const logs = [];
    for (const member of membersToCheck || []) {
      try {
        // Get bot settings for this community
        const { data: botSettings, error: settingsError } = await supabase
          .from("telegram_bot_settings")
          .select("*")
          .eq("community_id", member.community_id)
          .single();

        if (settingsError) {
          console.error("Error getting bot settings:", settingsError);
          continue;
        }

        // Process this member
        const result = await processMember(supabase, member, botSettings);
        logs.push(result);
        
      } catch (memberProcessError) {
        console.error(
          `Error processing member ${member.telegram_user_id}:`,
          memberProcessError
        );
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: `Processed ${membersToCheck?.length || 0} members`,
        logs,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error in check-subscriptions function:", error);

    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
