
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
    console.log("[webhook-main] Received OPTIONS request to telegram-webhook");
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
    } catch (e) {
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
    const result = await routeTelegramUpdate(supabase, telegramUpdate, { BOT_TOKEN: botToken });
    
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
