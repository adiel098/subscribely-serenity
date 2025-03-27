
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

    if (!member_id || !telegram_user_id || !chat_id) {
      await logger.error("Missing required parameters in request");
      return new Response(
        JSON.stringify({ success: false, error: "Missing required parameters" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    // Get the correct bot token if not provided
    let useBotToken = bot_token;
    if (!useBotToken) {
      try {
        // Look up bot token based on the community ID
        const { data: community, error: communityError } = await supabase
          .from('communities')
          .select('id, telegram_chat_id')
          .eq('id', chat_id)
          .single();
          
        if (communityError) {
          await logger.error(`Failed to find community: ${communityError.message}`);
          return new Response(
            JSON.stringify({ success: false, error: `Community not found: ${communityError.message}` }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 404 }
          );
        }
        
        // Check if the community has a custom bot or use the global one
        const { data: botSettings, error: botError } = await supabase
          .from('telegram_bot_settings')
          .select('use_custom_bot, custom_bot_token')
          .eq('community_id', chat_id)
          .single();
          
        if (botError) {
          await logger.error(`Failed to get bot settings: ${botError.message}`);
        }
        
        if (botSettings?.use_custom_bot && botSettings?.custom_bot_token) {
          useBotToken = botSettings.custom_bot_token;
          await logger.info("Using custom bot token for this community");
        } else {
          // Use global bot token
          const { data: globalSettings, error: globalError } = await supabase
            .from('telegram_global_settings')
            .select('bot_token')
            .single();
            
          if (globalError || !globalSettings?.bot_token) {
            await logger.error(`Failed to get global bot token: ${globalError?.message}`);
            return new Response(
              JSON.stringify({ success: false, error: "Bot token not found" }),
              { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
            );
          }
          
          useBotToken = globalSettings.bot_token;
          await logger.info("Using global bot token");
        }
      } catch (error) {
        await logger.error(`Error getting bot token: ${error.message}`);
        return new Response(
          JSON.stringify({ success: false, error: `Failed to get bot token: ${error.message}` }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
        );
      }
    }

    // First, get the actual Telegram chat ID from the community ID
    const { data: community, error: communityError } = await supabase
      .from('communities')
      .select('telegram_chat_id')
      .eq('id', chat_id)
      .single();
      
    if (communityError || !community?.telegram_chat_id) {
      await logger.error(`Failed to get telegram_chat_id for community: ${communityError?.message}`);
      return new Response(
        JSON.stringify({ success: false, error: `Could not find Telegram chat ID: ${communityError?.message}` }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 404 }
      );
    }
    
    const telegramChatId = community.telegram_chat_id;
    await logger.info(`Resolved community ID ${chat_id} to Telegram chat ID ${telegramChatId}`);

    // Initialize Telegram API client
    const telegramApi = new TelegramApiClient(useBotToken);
    
    // Use our member removal service
    const removalService = new MemberRemovalService(supabase);
    
    // Execute the removal as a manual action (admin-initiated)
    const result = await removalService.removeManually(
      telegramChatId, // Use the resolved Telegram chat ID instead of community ID
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
