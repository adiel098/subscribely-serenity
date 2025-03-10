
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
        console.log("Processing member:", JSON.stringify(member, null, 2));
        
        // Get bot settings for this community
        const { data: botSettings, error: settingsError } = await supabase
          .from("telegram_bot_settings")
          .select("*")
          .eq("community_id", member.community_id)
          .single();

        if (settingsError) {
          console.error(`Error getting bot settings for community ${member.community_id}:`, settingsError);
          logs.push({
            memberId: member.member_id,
            telegramUserId: member.telegram_user_id,
            action: "error",
            details: `Failed to get bot settings: ${settingsError.message}`
          });
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
        logs.push({
          memberId: member.member_id || "unknown",
          telegramUserId: member.telegram_user_id || "unknown",
          action: "error",
          details: `Processing error: ${memberProcessError.message}`
        });
      }
    }

    // Update the database with a status log
    try {
      await supabase
        .from("system_logs")
        .insert({
          event_type: "subscription_check",
          details: `Processed ${membersToCheck?.length || 0} members`,
          metadata: { logs }
        });
    } catch (logError) {
      console.error("Failed to log subscription check:", logError);
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: `Processed ${membersToCheck?.length || 0} members`,
        logs,
        timestamp: new Date().toISOString()
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error in check-subscriptions function:", error);

    // Log the error to the database
    try {
      const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
      const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
      const supabase = createClient(supabaseUrl, supabaseKey);
      
      await supabase
        .from("system_logs")
        .insert({
          event_type: "subscription_check_error",
          details: error.message,
          metadata: { stack: error.stack }
        });
    } catch (logError) {
      console.error("Failed to log error:", logError);
    }

    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
        stack: error.stack,
        timestamp: new Date().toISOString()
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
