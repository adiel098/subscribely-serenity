
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.43.2";
import { corsHeaders } from "./cors.ts";
import { processMember } from "./memberProcessor.ts";
import { logSystemEvent } from "./utils/databaseLogger.ts";

serve(async (req) => {
  // Handle CORS preflight request
  if (req.method === "OPTIONS") {
    return new Response("OK", { headers: corsHeaders });
  }

  try {
    console.log("🔄 Starting subscription check process...");
    
    // Create a Supabase client with the service role key
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Log execution start
    await logSystemEvent(
      supabase,
      "subscription_check_start", 
      "Starting scheduled subscription check",
      { timestamp: new Date().toISOString() }
    );

    // Use RPC to call the PostgreSQL function
    const { data: membersToCheck, error: memberError } = await supabase.rpc(
      "get_members_to_check_v2" // Using the function that returns text for subscription_status
    );

    if (memberError) {
      console.error("❌ Error getting members to check:", memberError);
      throw memberError;
    }

    console.log(`✅ Found ${membersToCheck?.length || 0} members to process`);

    // Process each member
    const logs = [];
    let processedCount = 0;
    
    if (membersToCheck && membersToCheck.length > 0) {
      for (const member of membersToCheck) {
        try {
          console.log("💫 Processing member:", JSON.stringify(member, null, 2));
          
          // Get bot settings for this community
          const { data: botSettings, error: settingsError } = await supabase
            .from("telegram_bot_settings")
            .select("*")
            .eq("community_id", member.community_id)
            .single();

          if (settingsError) {
            console.error(`❌ Error getting bot settings for community ${member.community_id}:`, settingsError);
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
          processedCount++;
          
        } catch (memberProcessError) {
          console.error(
            `❌ Error processing member ${member.telegram_user_id}:`,
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
    } else {
      console.log("ℹ️ No members to process at this time");
    }

    // Update the database with a status log
    await logSystemEvent(
      supabase,
      "subscription_check",
      `Processed ${processedCount} of ${membersToCheck?.length || 0} members`,
      { 
        logs,
        processedCount,
        totalMembers: membersToCheck?.length || 0,
        timestamp: new Date().toISOString()
      }
    );

    console.log("✅ Subscription check completed successfully");
    
    return new Response(
      JSON.stringify({
        success: true,
        message: `Processed ${processedCount} of ${membersToCheck?.length || 0} members`,
        logs,
        timestamp: new Date().toISOString()
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("❌ Error in check-subscriptions function:", error);

    // Log the error to the database
    try {
      const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
      const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
      const supabase = createClient(supabaseUrl, supabaseKey);
      
      await logSystemEvent(
        supabase,
        "subscription_check_error",
        error.message,
        { stack: error.stack }
      );
    } catch (logError) {
      console.error("❌ Failed to log error:", logError);
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
