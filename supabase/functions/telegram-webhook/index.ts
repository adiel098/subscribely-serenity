
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { setupWebhook, getWebhookInfo } from './webhookManager.ts'
import { 
  handleChatMemberUpdate,
  handleChatJoinRequest,
  handleNewMessage,
  handleEditedMessage,
  handleChannelPost,
  handleMyChatMember
} from './membershipHandler.ts'
import { logTelegramEvent } from './eventLogger.ts'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

console.log('🤖 Starting Telegram bot webhook...');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  console.log(`🔄 Received ${req.method} request to ${req.url}`);

  if (req.method === 'OPTIONS') {
    console.log('Handling CORS preflight request');
    return new Response(null, { 
      headers: corsHeaders,
      status: 200
    });
  }

  try {
    console.log('Creating Supabase client...');
    const supabase = createClient(
      SUPABASE_URL!,
      SUPABASE_SERVICE_ROLE_KEY!
    );

    try {
      const { error: connectionError } = await supabase
        .from('telegram_events')
        .select('id')
        .limit(1);

      if (connectionError) {
        console.error('Error connecting to Supabase:', connectionError);
        return new Response(
          JSON.stringify({ 
            ok: true,
            error: 'Database connection error',
            details: connectionError.message 
          }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200
          }
        );
      }
    } catch (error) {
      console.error('Error testing database connection:', error);
      return new Response(
        JSON.stringify({ 
          ok: true,
          error: 'Database connection test failed',
          details: error.message 
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200
        }
      );
    }

    console.log('Fetching bot token from settings...');
    const { data: settings, error: settingsError } = await supabase
      .from('telegram_global_settings')
      .select('bot_token')
      .single();

    if (settingsError) {
      console.error('Error fetching bot token:', settingsError);
      return new Response(
        JSON.stringify({ 
          ok: true,
          error: 'Failed to fetch bot token',
          details: settingsError.message 
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200
        }
      );
    }

    if (!settings?.bot_token) {
      console.error('Bot token is missing from settings');
      return new Response(
        JSON.stringify({ 
          ok: true,
          error: 'Bot token is missing'
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200
        }
      );
    }

    const BOT_TOKEN = settings.bot_token;
    console.log('✅ Successfully retrieved bot token');

    const url = new URL(req.url);
    if (url.pathname.endsWith('/check')) {
      console.log('Running webhook check...');
      try {
        const webhookInfo = await getWebhookInfo(BOT_TOKEN);
        const webhookUrl = `${SUPABASE_URL}/functions/v1/telegram-webhook`;
        const setupResult = await setupWebhook(BOT_TOKEN, webhookUrl);
        
        return new Response(
          JSON.stringify({ webhookInfo, setupResult }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200 
          }
        );
      } catch (error) {
        console.error('Error during webhook check:', error);
        return new Response(
          JSON.stringify({ 
            ok: true,
            error: 'Error checking webhook status',
            details: error.message 
          }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200
          }
        );
      }
    }

    if (req.method === 'POST') {
      console.log('Handling webhook update...');
      try {
        const update = await req.json();
        console.log('📥 Received update:', JSON.stringify(update, null, 2));

        // Log raw update for debugging
        await logTelegramEvent(supabase, 'raw_update', update);

        // Handle different types of updates
        if (update.message) {
          await handleNewMessage(supabase, update);
        }

        if (update.my_chat_member) {
          await handleMyChatMember(supabase, update);
        }

        if (update.chat_member) {
          await handleChatMemberUpdate(supabase, update);
        }

        if (update.chat_join_request) {
          await handleChatJoinRequest(supabase, update);
        }

        if (update.channel_post) {
          await handleChannelPost(supabase, update);
        }

        if (update.edited_message) {
          await handleEditedMessage(supabase, update);
        }

        console.log('✅ Successfully processed update');
        return new Response(
          JSON.stringify({ ok: true }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200 
          }
        );
      } catch (error) {
        console.error('Error processing webhook update:', error);
        await logTelegramEvent(supabase, 'error', {}, error.message);
        return new Response(
          JSON.stringify({ ok: true }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200
          }
        );
      }
    }

    return new Response(
      JSON.stringify({ 
        ok: true,
        error: 'Invalid request method' 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error('Unhandled error:', error);
    return new Response(
      JSON.stringify({ ok: true }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    );
  }
});
