
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from "./cors.ts";
import { routeTelegramWebhook } from "./router/webhookRouter.ts";

// Handle incoming requests
serve(async (req: Request) => {
  console.log("🚀 Telegram webhook function started");
  
  // Handle CORS preflight request
  if (req.method === "OPTIONS") {
    console.log("🛡️ Handling CORS preflight request");
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY") || "";
    
    // Print truncated keys to logs for debugging (without revealing full keys)
    console.log(`📌 Supabase URL: ${supabaseUrl ? "Provided ✅" : "Not provided ❌"}`);
    console.log(`📌 Supabase Anon Key: ${supabaseAnonKey ? "Provided ✅" : "Not provided ❌"}`);
    
    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    
    // Get bot token from environment variable
    const botToken = Deno.env.get("TELEGRAM_BOT_TOKEN") || "";
    console.log(`📌 Bot Token: ${botToken ? 
      `Provided (${botToken.substring(0, 3)}...${botToken.substring(botToken.length - 3)}) ✅` : 
      "Not provided ❌"
    }`);
    
    if (!botToken) {
      console.error("❌ TELEGRAM_BOT_TOKEN environment variable not set");
      throw new Error("Bot token not configured");
    }

    // Route the webhook request
    return await routeTelegramWebhook(req, supabase, botToken);
  } catch (error) {
    console.error("🔥 Critical error in webhook handler:", error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || "An unknown error occurred",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
