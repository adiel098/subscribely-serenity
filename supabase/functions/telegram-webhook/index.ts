
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { handleStartCommand } from './handlers/startCommandHandler.ts';
import { handleVerificationMessage } from './handlers/verificationHandler.ts';
import { handleChannelVerification } from './handlers/channelVerificationHandler.ts';
import { corsHeaders } from './cors.ts';

console.log("[WEBHOOK] Starting webhook service...");

serve(async (req) => {
  try {
    // Handle CORS
    if (req.method === 'OPTIONS') {
      return new Response('ok', { headers: corsHeaders });
    }

    // יצירת חיבור לסופהבייס
    console.log("[WEBHOOK] Creating Supabase client...");
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // קבלת הטוקן של הבוט מההגדרות הגלובליות
    console.log("[WEBHOOK] Fetching bot token...");
    const { data: settings, error: settingsError } = await supabaseClient
      .from('telegram_global_settings')
      .select('bot_token')
      .single();

    if (settingsError || !settings?.bot_token) {
      console.error("[WEBHOOK] Error fetching bot token:", settingsError);
      throw new Error('Bot token not found in settings');
    }

    const botToken = settings.bot_token;
    console.log("[WEBHOOK] Bot token retrieved successfully");

    const body = await req.json();
    
    // טיפול בבקשה להסרת חבר
    if (body.path === '/remove-member') {
      console.log('[WEBHOOK] Handling member removal:', body);
      try {
        // קודם מסירים את המשתמש מהקבוצה
        const kickResponse = await fetch(`https://api.telegram.org/bot${botToken}/kickChatMember`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            chat_id: body.chat_id,
            user_id: body.user_id
          })
        });

        const kickResult = await kickResponse.json();
        console.log('[WEBHOOK] Kick result:', kickResult);

        // מיד אחרי זה מסירים את ה-ban כדי שהמשתמש יוכל להצטרף שוב בעתיד
        const unbanResponse = await fetch(`https://api.telegram.org/bot${botToken}/unbanChatMember`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            chat_id: body.chat_id,
            user_id: body.user_id,
            only_if_banned: true
          })
        });

        const unbanResult = await unbanResponse.json();
        console.log('[WEBHOOK] Unban result:', unbanResult);

        return new Response(JSON.stringify({ 
          success: kickResult.ok && unbanResult.ok,
          kickResult,
          unbanResult
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      } catch (error) {
        console.error('[WEBHOOK] Error removing member:', error);
        throw error;
      }
    }

    // טיפול בהודעות רגילות
    const update = body;
    const message = update.message || update.channel_post;
    
    if (!message) {
      console.log("[WEBHOOK] No message or channel_post in update:", update);
      return new Response(JSON.stringify({ ok: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('🗨️ Processing message:', JSON.stringify(message, null, 2));

    let handled = false;

    if (['group', 'supergroup', 'channel'].includes(message.chat?.type) && message.text?.includes('MBF_')) {
      console.log("[WEBHOOK] Handling channel verification...");
      handled = await handleChannelVerification(supabaseClient, message, botToken);
      console.log("[WEBHOOK] Channel verification handled:", handled);
    }
    else if (message.text?.startsWith('/start')) {
      console.log("[WEBHOOK] Handling start command...");
      handled = await handleStartCommand(supabaseClient, message, botToken);
      console.log("[WEBHOOK] Start command handled:", handled);
    }
    else if (message.text?.startsWith('MBF_')) {
      console.log("[WEBHOOK] Handling verification message...");
      handled = await handleVerificationMessage(supabaseClient, message);
      console.log("[WEBHOOK] Verification handled:", handled);
    }

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

    return new Response(JSON.stringify({ ok: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('[WEBHOOK] Error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
