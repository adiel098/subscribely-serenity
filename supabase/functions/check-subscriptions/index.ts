
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.43.2";
import { corsHeaders } from "./cors.ts";
import { processMember } from "./memberProcessor.ts";
import { logSystemEvent } from "./utils/databaseLogger.ts";

serve(async (req) => {
  // Get current time with hours and minutes for logging
  const now = new Date();
  const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
  
  // Handle CORS preflight request
  if (req.method === "OPTIONS") {
    return new Response("OK", { headers: corsHeaders });
  }

  try {
    // Parse request body for community-specific check
    let community_id = null;
    if (req.method === "POST") {
      try {
        const requestData = await req.json();
        community_id = requestData.community_id || null;
      } catch (parseError) {
        console.log(`[${timeStr}] No community ID provided in request, will check all communities`);
      }
    }

    console.log(`🔄 [${timeStr}] Starting subscription check process${community_id ? ` for community: ${community_id}` : ''}`);
    
    // Create a Supabase client with the service role key
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Log execution start
    await logSystemEvent(
      supabase,
      "subscription_check_start", 
      `Starting ${community_id ? 'targeted' : 'scheduled'} subscription check`,
      { 
        community_id,
        timestamp: now.toISOString()
      }
    );

    // Use RPC to call the PostgreSQL function
    let queryParams = {};
    if (community_id) {
      queryParams = { community_id_param: community_id };
    }

    console.log(`📊 [${timeStr}] Fetching members to check with params:`, JSON.stringify(queryParams));
    const { data: membersToCheck, error: memberError } = await supabase.rpc(
      "get_members_to_check_v2",
      queryParams
    );

    if (memberError) {
      console.error(`❌ [${timeStr}] Error getting members to check:`, memberError);
      throw memberError;
    }

    console.log(`✅ [${timeStr}] Found ${membersToCheck?.length || 0} members to process`);

    // Process each member
    const logs = [];
    let processedCount = 0;
    
    if (membersToCheck && membersToCheck.length > 0) {
      for (const member of membersToCheck) {
        try {
          console.log(`💫 [${timeStr}] Processing member:`, JSON.stringify(member, null, 2));
          
          // Get bot settings for this community
          const { data: botSettings, error: settingsError } = await supabase
            .from("telegram_bot_settings")
            .select("*")
            .eq("community_id", member.community_id)
            .single();

          if (settingsError) {
            console.error(`❌ [${timeStr}] Error getting bot settings for community ${member.community_id}:`, settingsError);
            logs.push({
              memberId: member.member_id,
              telegramUserId: member.telegram_user_id,
              action: "error",
              details: `Failed to get bot settings: ${settingsError.message}`
            });
            continue;
          }

          console.log(`📋 [${timeStr}] BOT SETTINGS for ${member.community_id}:`, JSON.stringify(botSettings, null, 2));
          console.log(`⚙️ [${timeStr}] auto_remove_expired setting is: ${botSettings.auto_remove_expired ? 'ENABLED' : 'DISABLED'}`);

          // Process this member
          const result = await processMember(supabase, member, botSettings);
          logs.push(result);
          processedCount++;
          
          console.log(`✅ [${timeStr}] Processed member ${member.telegram_user_id} with result: ${result.action} - ${result.details}`);
        } catch (memberProcessError) {
          console.error(
            `❌ [${timeStr}] Error processing member ${member.telegram_user_id}:`,
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
      console.log(`ℹ️ [${timeStr}] No members to process${community_id ? ` for community ${community_id}` : ''} at this time`);
    }

    // Update the database with a status log
    await logSystemEvent(
      supabase,
      "subscription_check",
      `Processed ${processedCount} of ${membersToCheck?.length || 0} members`,
      { 
        community_id,
        logs,
        processedCount,
        totalMembers: membersToCheck?.length || 0,
        timestamp: now.toISOString()
      }
    );

    console.log(`✅ [${timeStr}] Subscription check completed successfully`);
    
    return new Response(
      JSON.stringify({
        success: true,
        message: `Processed ${processedCount} of ${membersToCheck?.length || 0} members`,
        logs,
        timestamp: now.toISOString()
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    console.error(`❌ [${timeStr}] Error in check-subscriptions function:`, error);

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
      console.error(`❌ [${timeStr}] Failed to log error:`, logError);
    }

    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
        stack: error.stack,
        timestamp: now.toISOString()
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
