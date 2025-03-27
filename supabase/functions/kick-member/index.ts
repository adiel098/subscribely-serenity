
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.7";
import { corsHeaders } from "../_shared/cors.ts";
import { TelegramApiClient } from "../_shared/telegram_api.ts";
import { createLogger } from "../_shared/logger.ts";

// Import our service for handling status changes
import { MemberRemovalService } from "../telegram-webhook/services/subscription/memberRemovalService.ts";

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Create clients
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!
    );
    
    const logger = createLogger(supabase, "KICK-MEMBER");
    await logger.info("Kick member function called");

    // Parse request body
    let requestData;
    try {
      requestData = await req.json();
    } catch (parseError) {
      await logger.error(`Invalid JSON: ${parseError.message}`);
      return new Response(
        JSON.stringify({ success: false, error: "Invalid JSON payload" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }
    
    const { member_id, telegram_user_id, chat_id, bot_token } = requestData;
    
    // Log request details
    await logger.info(`Request to kick member ${telegram_user_id} from chat ${chat_id}`);

    if (!member_id || !telegram_user_id || !chat_id || !bot_token) {
      await logger.error("Missing required parameters in request");
      return new Response(
        JSON.stringify({ success: false, error: "Missing required parameters" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    // Initialize Telegram API client
    const telegramApi = new TelegramApiClient(bot_token);
    
    // Use our member removal service
    const removalService = new MemberRemovalService(supabase);
    
    // Execute the removal as a manual action (admin-initiated)
    const result = await removalService.removeManually(
      chat_id, 
      telegram_user_id, 
      member_id,
      telegramApi
    );

    if (!result.success) {
      await logger.error(`Failed to process member removal: ${result.error}`);
      return new Response(
        JSON.stringify({ success: false, error: result.error }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
      );
    }

    // Return success response, with detailed result info
    return new Response(
      JSON.stringify({ 
        success: true,
        telegram_success: result.telegramSuccess,
        telegram_error: result.error
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );
  } catch (error) {
    console.error("Error in kick-member function:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
