import { corsHeaders } from "../cors.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { sendBroadcast } from "../handlers/broadcastHandler.ts";
import { handleNewMessage, handleEditedMessage, handleChannelPost } from "../handlers/messageHandler.ts";
import { handleMemberRoute } from "../handlers/routeHandlers/memberRouteHandler.ts";
import { handleJoinRequestRoute } from "../handlers/routeHandlers/joinRequestRouteHandler.ts";
import { handleCustomActionsRoute } from "../handlers/routeHandlers/customActionsRouteHandler.ts";
import { createLogger } from "../services/loggingService.ts";

export async function routeTelegramWebhook(req: Request, supabase: ReturnType<typeof createClient>, botToken: string) {
  const logger = createLogger(supabase, 'WEBHOOK-ROUTER');
  
  try {
    await logger.info(`🔄 Processing webhook request: ${req.method} ${new URL(req.url).pathname}`);
    
    // For custom function calls via the supabase.functions.invoke
    if (req.method === 'POST') {
      await logger.info(`🔄 Processing POST request`);
      
      // Parse the request body 
      let requestBody;
      try {
        requestBody = await req.json();
        await logger.info(`📝 Request body action: ${requestBody.action || 'Not specified'}`);
      } catch (error) {
        await logger.error('Error parsing request body', error);
        return new Response(
          JSON.stringify({ success: false, error: "Invalid JSON in request body" }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
        );
      }
      
      // Check for Telegram webhook update
      if (requestBody.update_id) {
        await logger.info('💬 Detected Telegram update, processing webhook');
        return await handleTelegramUpdate(requestBody, supabase, botToken);
      }
      
      // Otherwise, it's a function invocation with an action
      // Route based on the action type
      switch(requestBody.action) {
        case 'broadcast': {
          await logger.info(`🔄 Routing to broadcast handler`);
          await logger.info(`📝 Community ID: ${requestBody.community_id || 'Not provided'}`);
          await logger.info(`📝 Group ID: ${requestBody.group_id || 'Not provided'}`);
          
          if (!requestBody.message) {
            await logger.error(`❌ No message content provided for broadcast`);
            return new Response(
              JSON.stringify({ success: false, error: "No message content provided" }),
              { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
            );
          }
          
          // Call the broadcast handler
          try {
            await logger.info(`🔄 Executing broadcast operation`);
            
            const result = await sendBroadcast(
              supabase,
              requestBody.community_id,
              requestBody.group_id,
              requestBody.message,
              requestBody.filter_type || 'all',
              requestBody.subscription_plan_id,
              requestBody.include_button || false,
              requestBody.image || null
            );
            
            await logger.info(`✅ Broadcast completed successfully`);
            await logger.info(`📊 Result: ${JSON.stringify(result)}`);
            
            return new Response(
              JSON.stringify({ 
                success: true, 
                ...result
              }),
              { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
          } catch (error) {
            await logger.error(`❌ Broadcast operation failed:`, error);
            
            return new Response(
              JSON.stringify({ 
                success: false, 
                error: error.message || "Unknown error during broadcast",
                location: "broadcast handler" 
              }),
              { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
            );
          }
        }
        
        // Add other actions here as needed
        // case 'other_action': ...
        
        default: {
          await logger.warn(`⚠️ Unknown action type: ${requestBody.action}`);
          return new Response(
            JSON.stringify({ success: false, error: `Unknown action type: ${requestBody.action}` }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
          );
        }
      }
    }
    // Handle raw Telegram webhook updates (GET or direct POST to webhook)
    else if (req.method === 'GET' || req.method === 'POST') {
      try {
        const update = await req.json();
        await logger.info('📦 Processing direct webhook payload');
        return await handleTelegramUpdate(update, supabase, botToken);
      } catch (error) {
        await logger.error('❌ Error parsing webhook payload:', error);
        return new Response(
          JSON.stringify({ success: false, error: "Invalid JSON in webhook payload" }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
        );
      }
    }
    
    // If we get here, we didn't match any known route
    await logger.warn(`⚠️ No matching route for request`);
    return new Response(
      JSON.stringify({ success: false, error: "Not Found" }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 404 }
    );
    
  } catch (error) {
    await logger.error(`❌ Error routing webhook:`, error);
    await logger.error(`❌ Stack trace:`, error.stack);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || "Unknown error", 
        location: "webhook router" 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
}

/**
 * Handle a Telegram update (webhook event)
 */
async function handleTelegramUpdate(update: any, supabase: ReturnType<typeof createClient>, botToken: string) {
  const logger = createLogger(supabase, 'TELEGRAM-UPDATE');
  
  try {
    await logger.info("📦 Received Telegram update:", JSON.stringify(update, null, 2));
    
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
      await logger.info("💬 Detected message update");
      await handleNewMessage(supabase, update, { BOT_TOKEN: botToken });
      handled = true;
    }
    // Chat member update
    else if (update.chat_member) {
      updateType = "chat_member";
      await logger.info("👤 Detected chat member update");
      const result = await handleMemberRoute(supabase, update.chat_member, botToken);
      handled = result.handled;
      
      if (result.response) {
        response = result.response;
      }
    }
    // Join request
    else if (update.chat_join_request) {
      updateType = "chat_join_request";
      await logger.info("🤝 Detected chat join request");
      const result = await handleJoinRequestRoute(supabase, update.chat_join_request, botToken);
      handled = result.handled;
      
      if (result.response) {
        response = result.response;
      }
    }
    // Callback query
    else if (update.callback_query) {
      updateType = "callback_query";
      await logger.info("🔘 Detected callback query");
      const result = await handleCustomActionsRoute(supabase, update.callback_query, botToken);
      handled = result.handled;
      
      if (result.response) {
        response = result.response;
      }
    }
    // Inline query
    else if (update.inline_query) {
      updateType = "inline_query";
      await logger.info("🔍 Detected inline query - not implemented yet");
      // Not implemented yet
    }
    // Channel post
    else if (update.channel_post) {
      updateType = "channel_post";
      await logger.info("📢 Detected channel post");
      await handleChannelPost(supabase, update);
      handled = true;
    }
    // Edited message
    else if (update.edited_message) {
      updateType = "edited_message";
      await logger.info("✏️ Detected edited message");
      await handleEditedMessage(supabase, update);
      handled = true;
    }
    
    // Update the webhook log with the handling status
    await supabase.from('telegram_webhook_logs').update({
      event_type: updateType,
      details: handled ? 'handled' : 'not_handled'
    }).eq('payload', update);
    
    await logger.info(`${handled ? '✅' : '⚠️'} Update type: ${updateType}, Handled: ${handled}`);
    
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
    await logger.error('❌ Error handling Telegram update:', error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || "Unknown error processing Telegram update"
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
}
