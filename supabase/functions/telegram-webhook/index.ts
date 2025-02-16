
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

console.log('🤖 Starting Telegram bot webhook...');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

async function logTelegramEvent(supabase: any, eventType: string, data: any, error?: string) {
  try {
    console.log(`Logging ${eventType} event:`, JSON.stringify(data, null, 2));
    
    const eventData = {
      event_type: eventType,
      chat_id: data.message?.chat?.id || data.chat?.id || data.chat_join_request?.chat?.id || data.my_chat_member?.chat?.id,
      user_id: data.message?.from?.id || data.from?.id || data.chat_join_request?.from?.id || data.my_chat_member?.from?.id,
      username: data.message?.from?.username || data.from?.username || data.chat_join_request?.from?.username || data.my_chat_member?.from?.username,
      message_id: data.message?.message_id,
      message_text: data.message?.text,
      raw_data: data,
      error: error
    };

    console.log('Prepared event data:', JSON.stringify(eventData, null, 2));

    const { error: insertError } = await supabase
      .from('telegram_events')
      .insert([eventData]);

    if (insertError) {
      console.error('Error logging event:', insertError);
    } else {
      console.log('✅ Event logged successfully');
    }
  } catch (err) {
    console.error('Error in logTelegramEvent:', err);
  }
}

async function setupWebhook(botToken: string) {
  try {
    console.log('Setting up webhook...'); 
    const webhookUrl = `${SUPABASE_URL}/functions/v1/telegram-webhook`;
    console.log('Using webhook URL:', webhookUrl);
    
    // נגדיר את ה-webhook עם כל ההרשאות הנדרשות
    const allowedUpdates = [
      "message",
      "edited_message",
      "channel_post",
      "edited_channel_post",
      "my_chat_member",
      "chat_member",
      "chat_join_request"
    ];
    
    const response = await fetch(
      `https://api.telegram.org/bot${botToken}/setWebhook`,
      { 
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          url: webhookUrl,
          allowed_updates: allowedUpdates
        })
      }
    );
    const result = await response.json();
    console.log('Webhook setup result:', result);
    return result;
  } catch (error) {
    console.error('Error in setupWebhook:', error);
    throw error;
  }
}

async function getWebhookInfo(botToken: string) {
  try {
    console.log('Getting webhook info...'); 
    const response = await fetch(
      `https://api.telegram.org/bot${botToken}/getWebhookInfo`,
      { method: 'GET' }
    );
    const result = await response.json();
    console.log('Webhook info result:', result);
    return result;
  } catch (error) {
    console.error('Error in getWebhookInfo:', error);
    throw error;
  }
}

async function handleNewMessage(supabase: any, update: any) {
  console.log('🗨️ Processing new message:', JSON.stringify(update.message, null, 2));
  await logTelegramEvent(supabase, 'new_message', update);
}

async function handleChatJoinRequest(supabase: any, update: any) {
  console.log('👤 Processing chat join request:', JSON.stringify(update.chat_join_request, null, 2));
  await logTelegramEvent(supabase, 'chat_join_request', update);
}

async function handleChannelPost(supabase: any, update: any) {
  console.log('📢 Processing channel post:', JSON.stringify(update.channel_post, null, 2));
  await logTelegramEvent(supabase, 'channel_post', update);
}

async function handleEditedMessage(supabase: any, update: any) {
  console.log('✏️ Processing edited message:', JSON.stringify(update.edited_message, null, 2));
  await logTelegramEvent(supabase, 'edited_message', update);
}

async function handleLeftChatMember(supabase: any, update: any) {
  console.log('👋 Processing left chat member:', JSON.stringify(update.message?.left_chat_member, null, 2));
  await logTelegramEvent(supabase, 'left_chat_member', update);
}

async function handleNewChatMember(supabase: any, update: any) {
  console.log('🎉 Processing new chat members:', JSON.stringify(update.message?.new_chat_members || [update.message?.new_chat_member], null, 2));
  
  // נטפל בכל החברים החדשים (יכול להיות אחד או יותר)
  const newMembers = update.message?.new_chat_members || [update.message?.new_chat_member].filter(Boolean);
  
  for (const member of newMembers) {
    // נרשום לוג נפרד לכל חבר חדש
    await logTelegramEvent(supabase, 'new_chat_member', {
      ...update,
      new_chat_member: member
    });
    
    console.log(`✨ New member joined: ${member.first_name} ${member.last_name || ''} (@${member.username || 'no username'})`);
  }
}

async function handleMyChatMember(supabase: any, update: any) {
  console.log('👥 Processing my_chat_member update:', JSON.stringify(update.my_chat_member, null, 2));
  
  const chatMember = update.my_chat_member;
  // נבדוק אם זה אירוע של הצטרפות לערוץ
  if (chatMember.new_chat_member?.status === 'member' || 
      chatMember.new_chat_member?.status === 'administrator') {
    console.log('🎉 New channel membership detected!');
  }
  
  await logTelegramEvent(supabase, 'my_chat_member', update);
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

    console.log('Fetching bot token from settings...');
    const { data: settings, error: settingsError } = await supabase
      .from('telegram_global_settings')
      .select('bot_token')
      .single();

    if (settingsError) {
      console.error('Error fetching bot token:', settingsError);
      throw new Error('Failed to fetch bot token');
    }

    if (!settings?.bot_token) {
      console.error('Bot token is missing from settings');
      throw new Error('Bot token is missing');
    }

    const BOT_TOKEN = settings.bot_token;
    console.log('✅ Successfully retrieved bot token');

    const url = new URL(req.url);
    if (url.pathname.endsWith('/check')) {
      console.log('Running webhook check...');
      try {
        const webhookInfo = await getWebhookInfo(BOT_TOKEN);
        const setupResult = await setupWebhook(BOT_TOKEN);
        
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
          if (update.message.new_chat_members || update.message.new_chat_member) {
            await handleNewChatMember(supabase, update);
          } else if (update.message.left_chat_member) {
            await handleLeftChatMember(supabase, update);
          } else {
            await handleNewMessage(supabase, update);
          }
        }

        if (update.my_chat_member) {
          await handleMyChatMember(supabase, update);
        }

        if (update.chat_member) {
          console.log('👥 Received chat_member update:', JSON.stringify(update.chat_member, null, 2));
          await logTelegramEvent(supabase, 'chat_member', update);
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
          JSON.stringify({ 
            ok: true,
            error: 'Error processing update',
            details: error.message 
          }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200
          }
        );
      }
    }

    console.log('Invalid request method:', req.method);
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
      JSON.stringify({ 
        ok: true,
        error: 'Internal server error',
        details: error.message 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    );
  }
});
