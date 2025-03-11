import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1';
import { corsHeaders } from "../cors.ts";
import { handleMessageRoute } from "../handlers/routeHandlers/messageRouteHandler.ts";
import { handleMemberRoute } from "../handlers/routeHandlers/memberRouteHandler.ts";
import { handleJoinRequestRoute } from "../handlers/routeHandlers/joinRequestRouteHandler.ts";
import { handleCustomActionsRoute } from "../handlers/routeHandlers/customActionsRouteHandler.ts";

/**
 * Route a Telegram webhook request to the appropriate handler
 */
export async function routeTelegramWebhook(
  req: Request,
  supabase: ReturnType<typeof createClient>,
  botToken: string
): Promise<Response> {
  try {
    console.log("🧭 [WEBHOOK-ROUTER] Processing Telegram webhook request");
    
    // Parse the request body
    const update = await req.json();
    console.log("📦 [WEBHOOK-ROUTER] Request payload:", JSON.stringify(update, null, 2));
    
    // Log the update to the database for debugging
    await supabase.from('telegram_webhook_logs').insert({
      payload: update,
      event_type: 'webhook_received',
    });
    
    // Determine the update type based on the received data
    let updateType = "unknown";
    let handled = false;
    let response = null;
    
    // Message update
    if (update.message) {
      updateType = "message";
      console.log("💬 [WEBHOOK-ROUTER] Detected message update");
      const result = await handleMessageRoute(supabase, update.message, botToken);
      handled = result.handled;
      
      if (result.response) {
        response = result.response;
      }
    }
    // Chat member update
    else if (update.chat_member) {
      updateType = "chat_member";
      console.log("👤 [WEBHOOK-ROUTER] Detected chat member update");
      const result = await handleMemberRoute(supabase, update.chat_member, botToken);
      handled = result.handled;
      
      if (result.response) {
        response = result.response;
      }
    }
    // Join request
    else if (update.chat_join_request) {
      updateType = "chat_join_request";
      console.log("🤝 [WEBHOOK-ROUTER] Detected chat join request");
      const result = await handleJoinRequestRoute(supabase, update.chat_join_request, botToken);
      handled = result.handled;
      
      if (result.response) {
        response = result.response;
      }
    }
    // Callback query
    else if (update.callback_query) {
      updateType = "callback_query";
      console.log("🔘 [WEBHOOK-ROUTER] Detected callback query");
      const result = await handleCustomActionsRoute(supabase, update.callback_query, botToken);
      handled = result.handled;
      
      if (result.response) {
        response = result.response;
      }
    }
    // Inline query
    else if (update.inline_query) {
      updateType = "inline_query";
      console.log("🔍 [WEBHOOK-ROUTER] Detected inline query - not implemented yet");
      // Not implemented yet
    }
    // Channel post
    else if (update.channel_post) {
      updateType = "channel_post";
      console.log("📢 [WEBHOOK-ROUTER] Detected channel post - not implemented yet");
      // Not implemented yet
    }
    // Edited message
    else if (update.edited_message) {
      updateType = "edited_message";
      console.log("✏️ [WEBHOOK-ROUTER] Detected edited message - not implemented yet");
      // Not implemented yet
    }
    
    // Update the webhook log with the handling status
    await supabase.from('telegram_webhook_logs').update({
      event_type: updateType,
      details: handled ? 'handled' : 'not_handled'
    }).eq('payload', update);
    
    console.log(`${handled ? '✅' : '⚠️'} [WEBHOOK-ROUTER] Update type: ${updateType}, Handled: ${handled}`);
    
    // If a handler returned a specific response, use it
    if (response) {
      return response;
    }
    
    // Otherwise return a standard success response
    return new Response(
      JSON.stringify({
        success: true,
        message: `Webhook processed. Update type: ${updateType}, Handled: ${handled}`,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('❌ [WEBHOOK-ROUTER] Error routing webhook:', error);
    
    // Log the error to the database
    try {
      await supabase.from('telegram_errors').insert({
        error_type: 'webhook_router_error',
        error_message: error.message,
        stack_trace: error.stack,
      });
    } catch (logError) {
      console.error('❌ [WEBHOOK-ROUTER] Failed to log error to database:', logError);
    }
    
    return new Response(
      JSON.stringify({
        success: false,
        error: `Error routing webhook: ${error.message}`,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
}
