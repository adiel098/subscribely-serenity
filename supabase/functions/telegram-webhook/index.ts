
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.7";
import { corsHeaders } from "./cors.ts";
import { routeTelegramUpdate } from "./webhookRouter.ts";

// Debug mode flag for more verbose logging
const DEBUG_MODE = true;

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const url = new URL(req.url);
  
  if (DEBUG_MODE) {
    console.log(`📥 Webhook request received at: ${url.pathname}`);
    console.log(`📑 Request method: ${req.method}`);
    console.log(`🔍 Request headers:`, Object.fromEntries(req.headers.entries()));
  }

  try {
    // Get Supabase client and bot token
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    
    if (!supabaseUrl || !supabaseServiceKey) {
      console.error("Missing Supabase credentials");
      return new Response(
        JSON.stringify({ error: "Server configuration error" }),
        { headers: corsHeaders, status: 500 }
      );
    }
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Get bot token from global settings
    const { data: settings, error: settingsError } = await supabase
      .from('telegram_global_settings')
      .select('bot_token')
      .single();
      
    if (settingsError) {
      console.error("Failed to fetch bot token:", settingsError);
      return new Response(
        JSON.stringify({ error: "Bot token not found" }),
        { headers: corsHeaders, status: 500 }
      );
    }
    
    const BOT_TOKEN = settings.bot_token;
    
    if (!BOT_TOKEN) {
      console.error("Bot token is empty");
      return new Response(
        JSON.stringify({ error: "Bot token not configured" }),
        { headers: corsHeaders, status: 500 }
      );
    }

    // Parse the body content
    let update;
    try {
      update = await req.json();
    } catch (e) {
      console.error("Failed to parse webhook body:", e);
      return new Response(
        JSON.stringify({ error: "Invalid request body" }),
        { headers: corsHeaders, status: 400 }
      );
    }
    
    if (DEBUG_MODE) {
      console.log("📦 Webhook update payload:", JSON.stringify(update).substring(0, 500) + "...");
    }

    // Create context object for handlers
    const context = {
      BOT_TOKEN,
      DEBUG: DEBUG_MODE
    };

    // Route the update to appropriate handler
    const result = await routeTelegramUpdate(supabase, update, context);

    if (DEBUG_MODE) {
      console.log("✅ Webhook processing result:", result);
    }

    return new Response(
      JSON.stringify(result),
      { headers: corsHeaders, status: 200 }
    );
  } catch (error) {
    console.error("❌ Webhook error:", error);
    
    return new Response(
      JSON.stringify({ error: "Internal server error", details: error.message }),
      { headers: corsHeaders, status: 500 }
    );
  }
});
