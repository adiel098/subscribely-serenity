
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

console.log('🤖 Telegram bot webhook is running...'); // Added initial log

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface TelegramUpdate {
  update_id: number;
  message?: {
    message_id: number;
    from: {
      id: number;
      username?: string;
    };
    chat: {
      id: number;
      type: string;
    };
    text?: string;
  };
  my_chat_member?: {
    chat: {
      id: number;
      type: string;
    };
    from: {
      id: number;
      username?: string;
    };
    new_chat_member: {
      status: string;
    };
  };
}

async function setupWebhook(botToken: string) {
  console.log('Setting up webhook...'); // Added log
  const webhookUrl = `${SUPABASE_URL}/functions/v1/telegram-webhook`;
  console.log('Using webhook URL:', webhookUrl); // Added for debugging
  console.log('Using bot token:', `${botToken.slice(0, 5)}...${botToken.slice(-5)}`); // Log partial token for security
  
  const response = await fetch(
    `https://api.telegram.org/bot${botToken}/setWebhook`,
    { 
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ url: webhookUrl })
    }
  );
  const result = await response.json();
  console.log('Webhook setup result:', result); // Added log
  return result;
}

async function getWebhookInfo(botToken: string) {
  console.log('Getting webhook info...'); // Added log
  const response = await fetch(
    `https://api.telegram.org/bot${botToken}/getWebhookInfo`,
    { method: 'GET' }
  );
  const result = await response.json();
  console.log('Webhook info result:', result); // Added log
  return result;
}

serve(async (req) => {
  console.log(`🔄 Received ${req.method} request to ${new URL(req.url).pathname}`); // Added request log

  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      SUPABASE_URL!,
      SUPABASE_SERVICE_ROLE_KEY!
    )

    // Get the global bot token
    console.log('Fetching bot token from settings...'); // Added log
    const { data: settings, error: settingsError } = await supabase
      .from('telegram_global_settings')
      .select('bot_token')
      .single();

    if (settingsError || !settings?.bot_token) {
      console.error('Failed to get bot settings:', settingsError);
      throw new Error('Failed to get bot settings or bot token is missing');
    }

    const BOT_TOKEN = settings.bot_token;
    console.log('✅ Successfully retrieved bot token'); // Added log
    
    // Special endpoint to check webhook status
    const url = new URL(req.url);
    if (url.pathname.endsWith('/check')) {
      console.log('Running webhook check...'); // Added log
      const webhookInfo = await getWebhookInfo(BOT_TOKEN);
      const setupResult = await setupWebhook(BOT_TOKEN);
      return new Response(
        JSON.stringify({ webhookInfo, setupResult }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200 
        }
      );
    }

    // For direct Telegram webhook updates
    if (req.method === 'POST') {
      const update: TelegramUpdate = await req.json()
      console.log('📥 Received Telegram update:', JSON.stringify(update, null, 2))

      // Handle verification messages
      if (update.message?.text && update.message.text.startsWith('MBF_')) {
        const verificationCode = update.message.text.trim();
        const chatId = update.message.chat.id;
        console.log(`🔑 Processing verification code ${verificationCode} for chat ${chatId}`);
        
        // Find the bot settings with this verification code
        const { data: botSettings, error: botError } = await supabase
          .from('telegram_bot_settings')
          .update({ 
            chat_id: chatId.toString(),
            verified_at: new Date().toISOString(),
            is_admin: true
          })
          .eq('verification_code', verificationCode)
          .is('verified_at', null)
          .select()
          .single();

        if (botError) {
          console.error('❌ Error updating bot settings:', botError);
        }

        // Delete the verification message
        const deleteResult = await deleteTelegramMessage(BOT_TOKEN, chatId, update.message.message_id);
        console.log('🗑️ Delete message result:', deleteResult);

        if (!botError && botSettings) {
          // Send success message
          const messageResult = await sendTelegramMessage(
            BOT_TOKEN, 
            chatId, 
            "✅ Verification successful! Your Telegram group is now connected to Membify."
          );
          console.log('✉️ Success message result:', messageResult);
          console.log(`✅ Group ${chatId} verified with code ${verificationCode}`);
        }
        
        return new Response(JSON.stringify({ success: true }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        });
      }

      // Handle bot being added to a group
      if (update.my_chat_member?.new_chat_member.status === 'administrator') {
        const chatId = update.my_chat_member.chat.id;
        console.log(`👋 Bot added as admin to chat ${chatId}`);
        
        const messageResult = await sendTelegramMessage(
          BOT_TOKEN,
          chatId,
          "Thank you for adding me as an admin! Please paste the verification code to connect this group to your Membify account."
        );
        console.log('✉️ Welcome message result:', messageResult);
      }

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      })
    }

    return new Response(
      JSON.stringify({ error: 'Invalid request' }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )

  } catch (error) {
    console.error('❌ Error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})

// Helper function to send Telegram messages
async function sendTelegramMessage(token: string, chatId: number, text: string) {
  const url = `https://api.telegram.org/bot${token}/sendMessage`
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      chat_id: chatId,
      text: text,
    }),
  })
  
  return response.json()
}

// Helper function to delete Telegram messages
async function deleteTelegramMessage(token: string, chatId: number, messageId: number) {
  const url = `https://api.telegram.org/bot${token}/deleteMessage`
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      chat_id: chatId,
      message_id: messageId,
    }),
  })
  
  return response.json()
}
