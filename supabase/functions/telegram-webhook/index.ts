
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { handleStartCommand } from './handlers/startCommandHandler.ts';
import { handleVerificationMessage } from './handlers/verificationHandler.ts';
import { handleChannelVerification } from './handlers/channelVerificationHandler.ts';
import { handleChatMemberUpdate } from './handlers/chatMemberHandler.ts';
import { handleChatJoinRequest } from './handlers/joinRequestHandler.ts';
import { kickMember } from './handlers/kickMemberHandler.ts';
import { corsHeaders } from './cors.ts';

console.log("[WEBHOOK] 🚀 Starting webhook service...");

serve(async (req) => {
  console.log(`[WEBHOOK] 📥 Received ${req.method} request`);
  
  try {
    // Handle CORS
    if (req.method === 'OPTIONS') {
      console.log("[WEBHOOK] ✅ Handling CORS preflight request");
      return new Response('ok', { headers: corsHeaders });
    }

    // Create Supabase client
    console.log("[WEBHOOK] 🔌 Creating Supabase client...");
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!supabaseUrl || !supabaseServiceKey) {
      console.error("[WEBHOOK] ❌ Missing Supabase credentials:", { 
        urlExists: !!supabaseUrl, 
        keyExists: !!supabaseServiceKey 
      });
      throw new Error('Missing Supabase credentials');
    }
    
    const supabaseClient = createClient(supabaseUrl, supabaseServiceKey);
    console.log("[WEBHOOK] ✅ Supabase client created successfully");

    // Get bot token from settings
    console.log("[WEBHOOK] 🔑 Fetching bot token...");
    const { data: settings, error: settingsError } = await supabaseClient
      .from('telegram_global_settings')
      .select('bot_token')
      .single();

    if (settingsError || !settings?.bot_token) {
      console.error("[WEBHOOK] ❌ Error fetching bot token:", settingsError);
      throw new Error('Bot token not found in settings');
    }

    const botToken = settings.bot_token;
    console.log("[WEBHOOK] ✅ Bot token retrieved successfully");

    // Parse request body
    let body;
    try {
      body = await req.json();
      console.log("[WEBHOOK] 📝 Request body parsed successfully");
      console.log("[WEBHOOK] 📦 Request body:", JSON.stringify(body, null, 2));
    } catch (error) {
      console.error("[WEBHOOK] ❌ Error parsing request body:", error);
      throw new Error('Invalid JSON in request body');
    }
    
    // Check if user is suspended before processing any requests
    if (body.message?.from?.id) {
      const telegramUserId = body.message.from.id.toString();
      
      // Check user suspension status
      const { data: userProfile, error: profileError } = await supabaseClient
        .from('profiles')
        .select('is_suspended')
        .eq('id', telegramUserId)
        .single();
      
      if (profileError) {
        console.error("[WEBHOOK] ❌ Error checking user suspension status:", profileError);
      } else if (userProfile?.is_suspended) {
        console.log("[WEBHOOK] 🚫 Suspended user attempted action:", telegramUserId);
        return new Response(JSON.stringify({ 
          ok: true,
          message: "User is suspended" 
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    }

    // Handle chat join requests
    if (body.chat_join_request) {
      console.log("[WEBHOOK] 🔄 Handling chat join request:", JSON.stringify(body.chat_join_request, null, 2));
      return await handleChatJoinRequest(supabaseClient, body);
    }

    // Handle member removal
    if (body.path === '/remove-member') {
      console.log('[WEBHOOK] 🔄 Handling member removal request:', JSON.stringify(body, null, 2));
      try {
        // Validate that we have the required parameters
        if (!body.chat_id || !body.user_id) {
          console.error('[WEBHOOK] ❌ Missing required parameters for member removal:', body);
          return new Response(JSON.stringify({ 
            success: false, 
            error: 'Missing required parameters: chat_id and user_id are required' 
          }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400
          });
        }
        
        console.log(`[WEBHOOK] 👤 Removing user ${body.user_id} from chat ${body.chat_id}`);
        const success = await kickMember(
          supabaseClient,
          body.chat_id,
          body.user_id,
          botToken
        );

        console.log(`[WEBHOOK] ${success ? '✅' : '❌'} Member removal ${success ? 'successful' : 'failed'}`);
        return new Response(JSON.stringify({ success }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      } catch (error) {
        console.error('[WEBHOOK] ❌ Error removing member:', error);
        return new Response(JSON.stringify({ 
          success: false, 
          error: error.message || 'An unknown error occurred' 
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500
        });
      }
    }

    // Handle chat member updates
    if (body.chat_member) {
      console.log('[WEBHOOK] 👥 Handling chat member update:', JSON.stringify(body.chat_member, null, 2));
      return await handleChatMemberUpdate(supabaseClient, body.chat_member);
    }

    // Handle regular messages
    const update = body;
    const message = update.message || update.channel_post;
    
    if (!message) {
      console.log("[WEBHOOK] ℹ️ No message or channel_post in update:", JSON.stringify(update, null, 2));
      return new Response(JSON.stringify({ ok: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('🗨️ Processing message:', JSON.stringify(message, null, 2));

    let handled = false;

    // Handle different message types
    if (['group', 'supergroup', 'channel'].includes(message.chat?.type) && message.text?.includes('MBF_')) {
      console.log("[WEBHOOK] 🔄 Handling channel verification...");
      handled = await handleChannelVerification(supabaseClient, message, botToken);
      console.log(`[WEBHOOK] ${handled ? '✅' : '❌'} Channel verification ${handled ? 'handled successfully' : 'not handled'}`);
    }
    else if (message.text?.startsWith('/start')) {
      console.log("[WEBHOOK] 🚀 Handling start command...");
      handled = await handleStartCommand(supabaseClient, message, botToken);
      console.log(`[WEBHOOK] ${handled ? '✅' : '❌'} Start command ${handled ? 'handled successfully' : 'not handled'}`);
    }
    else if (message.text?.startsWith('MBF_')) {
      console.log("[WEBHOOK] 🔄 Handling verification message...");
      handled = await handleVerificationMessage(supabaseClient, message);
      console.log(`[WEBHOOK] ${handled ? '✅' : '❌'} Verification ${handled ? 'handled successfully' : 'not handled'}`);
    }

    // Log event to database
    try {
      console.log("[WEBHOOK] 📝 Logging event to database...");
      await supabaseClient
        .from('telegram_events')
        .insert({
          event_type: update.channel_post ? 'channel_post' : 'webhook_update',
          raw_data: update,
          handled: handled,
          chat_id: message.chat?.id?.toString(),
          message_text: message.text,
          username: message.from?.username
        });
      console.log("[WEBHOOK] ✅ Event logged successfully");
    } catch (logError) {
      console.error("[WEBHOOK] ❌ Error logging event:", logError);
    }

    return new Response(JSON.stringify({ ok: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('[WEBHOOK] ❌ Error processing request:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
