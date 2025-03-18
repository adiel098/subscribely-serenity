
import { corsHeaders } from "../cors.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { sendBroadcast } from "../handlers/broadcastHandler.ts";
import { handleMessageRoute } from "../handlers/routeHandlers/messageRouteHandler.ts";
import { handleMemberRoute } from "../handlers/routeHandlers/memberRouteHandler.ts";
import { handleJoinRequestRoute } from "../handlers/routeHandlers/joinRequestRouteHandler.ts";
import { handleCustomActionsRoute } from "../handlers/routeHandlers/customActionsRouteHandler.ts";

export async function routeTelegramWebhook(req: Request, supabase: ReturnType<typeof createClient>, botToken: string) {
  console.log(`🔄 [WEBHOOK-ROUTER] Processing webhook request: ${req.method} ${new URL(req.url).pathname}`);
  
  try {
    // For custom function calls via the supabase.functions.invoke
    if (req.method === 'POST') {
      console.log(`🔄 [WEBHOOK-ROUTER] Processing POST request`);
      
      // Parse the request body
      const requestBody = await req.json();
      console.log(`📝 [WEBHOOK-ROUTER] Request body action: ${requestBody.action || 'Not specified'}`);
      
      // Route based on the action type
      switch(requestBody.action) {
        case 'broadcast': {
          console.log(`🔄 [WEBHOOK-ROUTER] Routing to broadcast handler`);
          console.log(`📝 [WEBHOOK-ROUTER] Community ID: ${requestBody.community_id || 'Not provided'}`);
          console.log(`📝 [WEBHOOK-ROUTER] Group ID: ${requestBody.group_id || 'Not provided'}`);
          
          if (!requestBody.message) {
            console.error(`❌ [WEBHOOK-ROUTER] No message content provided for broadcast`);
            return new Response(
              JSON.stringify({ success: false, error: "No message content provided" }),
              { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
            );
          }
          
          // Call the broadcast handler
          try {
            console.log(`🔄 [WEBHOOK-ROUTER] Executing broadcast operation`);
            
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
            
            console.log(`✅ [WEBHOOK-ROUTER] Broadcast completed successfully`);
            console.log(`📊 [WEBHOOK-ROUTER] Result: ${JSON.stringify(result)}`);
            
            return new Response(
              JSON.stringify({ 
                success: true, 
                ...result
              }),
              { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
          } catch (error) {
            console.error(`❌ [WEBHOOK-ROUTER] Broadcast operation failed:`, error);
            
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
        
        // ... keep existing code for other action handlers
        
        default: {
          console.warn(`⚠️ [WEBHOOK-ROUTER] Unknown action type: ${requestBody.action}`);
          return new Response(
            JSON.stringify({ success: false, error: `Unknown action type: ${requestBody.action}` }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
          );
        }
      }
    }
    
    // Handle Telegram webhook updates
    else if (req.method === 'GET' || req.method === 'POST' && new URL(req.url).pathname.endsWith('telegram-webhook')) {
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
    }
    
    // If we get here, we didn't match any known route
    console.warn(`⚠️ [WEBHOOK-ROUTER] No matching route for request`);
    return new Response(
      JSON.stringify({ success: false, error: "Not Found" }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 404 }
    );
    
  } catch (error) {
    console.error(`❌ [WEBHOOK-ROUTER] Error routing webhook:`, error);
    console.error(`❌ [WEBHOOK-ROUTER] Stack trace:`, error.stack);
    
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
