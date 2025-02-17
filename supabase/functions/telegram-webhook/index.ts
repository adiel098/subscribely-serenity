
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { TelegramClient } from "./telegramClient.ts";
import { WebhookManager } from "./webhookManager.ts";
import { corsHeaders } from "./cors.ts";
import { handleChat } from "./communityHandler.ts";
import { handleSubscription } from "./subscriptionHandler.ts";
import { handleMember } from "./memberHandler.ts";
import { handleMessage } from "./handlers/messageHandler.ts";
import { handleChatMember } from "./handlers/chatMemberHandler.ts";
import { handleJoinRequest } from "./handlers/joinRequestHandler.ts";
import { handleActivityUpdate } from "./handlers/activityHandler.ts";
import { logEvent } from "./eventLogger.ts";

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    console.log('Received request:', {
      url: req.url,
      pathname: new URL(req.url).pathname,
      path: new URL(req.url).pathname.split('/').pop(),
      method: req.method
    });

    // Parse request body
    const body = await req.json();
    console.log('Request body:', body);

    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Initialize Telegram client
    const telegramClient = new TelegramClient(
      Deno.env.get('TELEGRAM_BOT_TOKEN') || ''
    );

    // Get the path from the URL
    const path = new URL(req.url).pathname.split('/').pop();
    
    // Route to appropriate handler based on path
    switch (path) {
      case 'update-activity':
        return handleActivityUpdate(body, supabaseClient, corsHeaders);
      
      case 'log-event':
        // Handle event logging
        const { communityId, eventType, userId, metadata, amount } = body;
        try {
          const result = await logEvent(supabaseClient, {
            communityId,
            eventType,
            userId,
            metadata,
            amount
          });
          
          return new Response(
            JSON.stringify({ success: true, data: result }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        } catch (error) {
          console.error('Error logging event:', error);
          return new Response(
            JSON.stringify({ error: error.message }),
            { 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
              status: 400
            }
          );
        }

      default:
        // Handle Telegram webhook updates
        if (!body.update_id) {
          return new Response(
            JSON.stringify({ error: 'Invalid webhook data' }),
            { 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
              status: 400
            }
          );
        }

        const webhookManager = new WebhookManager(body, telegramClient, supabaseClient);
        
        // Route based on update type
        if (body.message) {
          await handleMessage(body.message, telegramClient, supabaseClient);
        }
        if (body.chat_member) {
          await handleChatMember(body.chat_member, telegramClient, supabaseClient);
        }
        if (body.chat_join_request) {
          await handleJoinRequest(body.chat_join_request, telegramClient, supabaseClient);
        }

        return new Response(JSON.stringify({ ok: true }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
  } catch (error) {
    console.error('Error in webhook handler:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    );
  }
});
