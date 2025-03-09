
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from "./cors.ts";
import { routeTelegramWebhook } from "./router/webhookRouter.ts";

// Handle incoming requests
serve(async (req: Request) => {
  console.log("🔥🔥🔥 TELEGRAM WEBHOOK FUNCTION STARTED 🔥🔥🔥");
  console.log(`📊 Request method: ${req.method}, URL: ${req.url}`);
  
  // Handle CORS preflight request
  if (req.method === "OPTIONS") {
    console.log("🛡️ Handling CORS preflight request");
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY") || "";
    
    // Print sanitized keys to logs for debugging (without revealing full keys)
    console.log(`📌 Supabase URL present: ${supabaseUrl ? "Yes ✅" : "No ❌"}`);
    console.log(`📌 Supabase Anon Key present: ${supabaseAnonKey ? "Yes ✅" : "No ❌"}`);
    
    if (!supabaseUrl || !supabaseAnonKey) {
      console.error("❌ CRITICAL: Missing Supabase configuration");
      throw new Error("Supabase configuration missing");
    }
    
    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    console.log("✅ Supabase client initialized successfully");
    
    // Get bot token from environment variable
    const botToken = Deno.env.get("TELEGRAM_BOT_TOKEN") || "";
    console.log(`📌 Bot Token present: ${botToken ? "Yes ✅" : "No ❌"}`);
    
    if (!botToken) {
      console.error("❌ CRITICAL: TELEGRAM_BOT_TOKEN environment variable not set");
      
      // Try to log this error in the database
      try {
        await supabase.from('telegram_errors').insert({
          error_type: 'missing_bot_token',
          error_message: 'TELEGRAM_BOT_TOKEN environment variable not set',
          stack_trace: 'N/A',
          context: { webhook_url: req.url }
        });
        console.log("✅ Missing token error logged to database");
      } catch (logError) {
        console.error("❌ Failed to log missing token error:", logError);
      }
      
      throw new Error("Bot token not configured");
    }

    // Token is present, obscure most of it in logs for security
    if (botToken.length > 10) {
      const maskedToken = `${botToken.substring(0, 4)}...${botToken.substring(botToken.length - 4)}`;
      console.log(`🔑 Using bot token: ${maskedToken}`);
    }

    // Route the webhook request
    console.log("🚀 Routing webhook request to handler");
    return await routeTelegramWebhook(req, supabase, botToken);
  } catch (error) {
    console.error("🔥 Critical error in webhook handler:", error);
    console.error("🔥 Error stack:", error.stack);
    
    // Try to create a detailed error object
    const errorDetails = {
      message: error.message || 'Unknown error',
      stack: error.stack || 'No stack trace',
      name: error.name || 'Error',
      url: req.url,
      method: req.method,
      timestamp: new Date().toISOString()
    };
    
    // Try to initialize a minimal Supabase client to log the error
    try {
      const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
      const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY") || "";
      
      if (supabaseUrl && supabaseAnonKey) {
        const supabase = createClient(supabaseUrl, supabaseAnonKey);
        
        await supabase.from('telegram_errors').insert({
          error_type: 'critical_webhook_error',
          error_message: error.message,
          stack_trace: error.stack,
          context: errorDetails
        }).then(result => {
          if (result.error) {
            console.error("❌ Failed to log critical error to database:", result.error);
          } else {
            console.log("✅ Critical error logged to database");
          }
        });
      }
    } catch (logError) {
      console.error("❌ Failed to log critical error:", logError);
    }
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || "An unknown error occurred",
        details: errorDetails
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
