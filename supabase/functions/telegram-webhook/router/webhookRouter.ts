
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { logTelegramEvent } from '../eventLogger.ts';
import { corsHeaders } from '../cors.ts';
import { checkUserSuspension } from '../services/userValidationService.ts';
import { logWebhookEvent, logWebhookError } from '../services/eventLoggingService.ts';
import { handleJoinRequestRoute } from '../handlers/routeHandlers/joinRequestRouteHandler.ts';
import { handleCustomActionsRoute } from '../handlers/routeHandlers/customActionsRouteHandler.ts';
import { handleMemberRoute } from '../handlers/routeHandlers/memberRouteHandler.ts';
import { handleMessageRoute } from '../handlers/routeHandlers/messageRouteHandler.ts';

export async function routeTelegramWebhook(req: Request, supabaseClient: ReturnType<typeof createClient>, botToken: string) {
  console.log("[ROUTER] 🚀🚀🚀 Received webhook request");
  
  try {
    let body;
    try {
      body = await req.json();
      console.log("[ROUTER] 📝 Request body parsed successfully");
      // Log truncated version to avoid huge logs
      const bodyPreview = JSON.stringify(body).substring(0, 500) + (JSON.stringify(body).length > 500 ? '...' : '');
      console.log("[ROUTER] 📦 Request body preview:", bodyPreview);
      
      // Log the full event
      await logTelegramEvent(supabaseClient, 'webhook_received', body);
    } catch (error) {
      console.error("[ROUTER] ❌ Error parsing request body:", error);
      throw new Error('Invalid JSON in request body');
    }
    
    // Check if request is a custom action route by looking for path property
    if (body.path) {
      console.log("[ROUTER] 🛣️ Detected custom action route:", body.path);
      const { handled, response } = await handleCustomActionsRoute(
        supabaseClient, 
        body.path, 
        body, 
        botToken
      );
      
      if (handled && response) {
        return response;
      }
    }
    
    // Check if user is suspended before processing any requests
    if (body.message?.from?.id) {
      const telegramUserId = body.message.from.id.toString();
      const isSuspended = await checkUserSuspension(supabaseClient, telegramUserId);
      
      if (isSuspended) {
        return new Response(JSON.stringify({ 
          ok: true,
          message: "User is suspended" 
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    }

    // Handle chat join requests
    const joinRequestResult = await handleJoinRequestRoute(supabaseClient, body);
    if (joinRequestResult.handled) {
      return joinRequestResult.response;
    }

    // Handle chat member updates (bot status, member changes)
    const memberResult = await handleMemberRoute(supabaseClient, body, botToken);
    if (memberResult.handled) {
      return memberResult.response;
    }

    // Handle regular messages
    const update = body;
    const message = update.message || update.channel_post;
    
    if (!message) {
      console.log("[ROUTER] ℹ️ No message or channel_post in update");
      return new Response(JSON.stringify({ ok: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Enhanced logging for start commands
    if (message.text && message.text.startsWith('/start')) {
      console.log("[ROUTER] 🔍 Detected start command with text:", message.text);
      const parts = message.text.split(' ');
      if (parts.length > 1) {
        const param = parts[1];
        console.log("[ROUTER] 🔑 Start parameter detected:", param);
        
        if (param.startsWith('group_')) {
          console.log("[ROUTER] 👥 GROUP PARAMETER DETECTED:", param.substring(6));
        } else {
          console.log("[ROUTER] 🏠 Community parameter detected:", param);
        }
      }
    }

    // Process message
    console.log("[ROUTER] 📨 Processing message via messageRoute handler");
    const messageResult = await handleMessageRoute(supabaseClient, message, botToken);
    const handled = messageResult.handled;
    console.log(`[ROUTER] ${handled ? '✅' : '❌'} Message ${handled ? 'was handled' : 'was NOT handled'} by messageRoute`);

    // Log event to database
    await logWebhookEvent(supabaseClient, update, message, handled);

    return new Response(JSON.stringify({ ok: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('[ROUTER] ❌ Error processing request:', error);
    
    // Try to log the error
    await logWebhookError(supabaseClient, error);
    
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
}
