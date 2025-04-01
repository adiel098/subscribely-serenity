
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { routeTelegramUpdate } from "./webhookRouter.ts";

// Define CORS headers for preflight requests
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Main function to handle requests
serve(async (req) => {
  console.log("[webhook-main] Telegram webhook edge function initialized");
  
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    console.log("[webhook-main] Handling CORS preflight request");
    return new Response(null, { headers: corsHeaders });
  }

  // For actual webhook requests, continue processing
  console.log("[webhook-main] Received POST request to telegram-webhook");
  
  try {
    // Get the bot token from environment variables
    const botToken = Deno.env.get("TELEGRAM_BOT_TOKEN");
    if (!botToken) {
      throw new Error("TELEGRAM_BOT_TOKEN environment variable not set");
    }
    
    // Initialize the Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    console.log("[webhook-main] Supabase client initialized");

    // Parse the Telegram update from the request body
    let telegramUpdate;
    try {
      telegramUpdate = await req.json();
      console.log("[webhook-main] Received update:", JSON.stringify(telegramUpdate, null, 2));
    } catch (e) {
      console.error("[webhook-main] Failed to parse request body:", e);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: "Invalid JSON in request body" 
        }),
        { 
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400 
        }
      );
    }

    // Process the Telegram update using the router
    console.log("[webhook-main] Processing update with router");
    const result = await routeTelegramUpdate(supabase, telegramUpdate, { BOT_TOKEN: botToken });
    console.log("[webhook-main] Result from router:", JSON.stringify(result, null, 2));
    
    // Log the webhook event to the database
    try {
      await supabase.from('telegram_events').insert({
        event_type: 'WEBHOOK',
        raw_data: telegramUpdate,
        chat_id: telegramUpdate.message?.chat?.id?.toString() || 
                telegramUpdate.channel_post?.chat?.id?.toString() || 
                telegramUpdate.chat_member?.chat?.id?.toString() || 
                telegramUpdate.my_chat_member?.chat?.id?.toString(),
        user_id: telegramUpdate.message?.from?.id?.toString() || 
                telegramUpdate.channel_post?.from?.id?.toString() || 
                telegramUpdate.chat_member?.from?.id?.toString() || 
                telegramUpdate.my_chat_member?.from?.id?.toString(),
        username: telegramUpdate.message?.from?.username || 
                telegramUpdate.channel_post?.from?.username || 
                telegramUpdate.chat_member?.from?.username || 
                telegramUpdate.my_chat_member?.from?.username,
        message_id: telegramUpdate.message?.message_id?.toString() || 
                    telegramUpdate.channel_post?.message_id?.toString(),
        message_text: telegramUpdate.message?.text || 
                     telegramUpdate.channel_post?.text
      });
      console.log("[webhook-main] Successfully logged webhook event to database");
    } catch (logError) {
      console.error("[webhook-main] Error logging webhook event:", logError);
      // Continue processing even if logging fails
    }
    
    // Also add to system_logs
    try {
      await supabase.from('system_logs').insert({
        event_type: 'TELEGRAM_WEBHOOK',
        details: `Received update_id=${telegramUpdate.update_id}, handled=${result.success}`,
        metadata: {
          update_id: telegramUpdate.update_id,
          result: result,
          update_type: Object.keys(telegramUpdate).filter(key => key !== 'update_id')[0]
        }
      });
      console.log("Logging webhook event: update_id=" + telegramUpdate.update_id + ", handled=" + result.success);
    } catch (logError) {
      console.error("[webhook-main] Error logging to system_logs:", logError);
    }
    
    // Return the processing result
    return new Response(
      JSON.stringify(result),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: result.success ? 200 : 400
      }
    );
  } catch (error) {
    console.error("[webhook-main] Unhandled error:", error);
    
    // Return an error response
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || "Unknown error"
      }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500
      }
    );
  }
});
