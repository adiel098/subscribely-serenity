import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

console.log('🤖 Telegram bot webhook is running...');

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
      title?: string;
    };
    text?: string;
  };
  channel_post?: {
    message_id: number;
    chat: {
      id: number;
      type: string;
      title?: string;
    };
    text?: string;
  };
  my_chat_member?: {
    chat: {
      id: number;
      type: string;
      title?: string;
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
  console.log('Setting up webhook...'); 
  const webhookUrl = `${SUPABASE_URL}/functions/v1/telegram-webhook`;
  console.log('Using webhook URL:', webhookUrl);
  console.log('Using bot token:', `${botToken.slice(0, 5)}...${botToken.slice(-5)}`);
  
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
  console.log('Webhook setup result:', result);
  return result;
}

async function getWebhookInfo(botToken: string) {
  console.log('Getting webhook info...'); 
  const response = await fetch(
    `https://api.telegram.org/bot${botToken}/getWebhookInfo`,
    { method: 'GET' }
  );
  const result = await response.json();
  console.log('Webhook info result:', result);
  return result;
}

serve(async (req) => {
  console.log(`🔄 Received ${req.method} request to ${new URL(req.url).pathname}`);

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
    console.log('Fetching bot token from settings...');
    const { data: settings, error: settingsError } = await supabase
      .from('telegram_global_settings')
      .select('bot_token')
      .single();

    if (settingsError || !settings?.bot_token) {
      console.error('Failed to get bot settings:', settingsError);
      throw new Error('Failed to get bot settings or bot token is missing');
    }

    const BOT_TOKEN = settings.bot_token;
    console.log('✅ Successfully retrieved bot token');
    
    // Special endpoint to check webhook status
    const url = new URL(req.url);
    if (url.pathname.endsWith('/check')) {
      console.log('Running webhook check...');
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

      const messageText = update.message?.text;
      const chatId = update.message?.chat.id;

      console.log('Message text:', messageText);
      console.log('Chat ID:', chatId);

      // בדיקה אם ההודעה מגיעה מהstart parameter
      if (messageText && chatId && messageText.startsWith('/start')) {
        console.log('Detected /start command');
        const startParams = messageText.split(' ')[1]; // מקבל את הפרמטרים אחרי ה-/start
        console.log('Start parameters:', startParams);
        
        if (startParams) {
          const communityId = startParams;
          console.log('Looking for community with ID:', communityId);
          
          // חיפוש הקהילה לפי ה-ID
          const { data: community, error: communityError } = await supabase
            .from('communities')
            .select('id, name')
            .eq('id', communityId)
            .single();

          if (communityError || !community) {
            console.error('Community not found:', communityError);
            await sendTelegramMessage(BOT_TOKEN, chatId, "הקהילה לא נמצאה. אנא בדקו את הלינק ונסו שוב.");
            return new Response(JSON.stringify({ success: true }), {
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
              status: 200,
            });
          }

          console.log('Found community:', community);

          // יצירת לינק למיני אפליקציה - שימו לב לפורמט החדש
          const miniAppUrl = `https://t.me/membifybot/app?startapp=${encodeURIComponent(community.id)}`;
          
          // שליחת הודעה עם כפתור שמוביל למיני אפליקציה
          const message = `
ברוכים הבאים לקהילת ${community.name}! 
לחצו על הכפתור למטה כדי להצטרף לקהילה 👇
          `;

          const replyMarkup = {
            inline_keyboard: [[
              {
                text: "הצטרפו לקהילה 🚀",
                url: miniAppUrl
              }
            ]]
          };

          console.log('Sending welcome message with mini app button, URL:', miniAppUrl);
          const result = await sendTelegramMessageWithMarkup(BOT_TOKEN, chatId, message, replyMarkup);
          console.log('Message sent result:', result);
        }
      }
      
      // בדיקה אם ההודעה היא קוד קהילה
      else if (messageText && chatId && messageText.startsWith('COM_')) {
        console.log('Detected community code:', messageText);
        
        // חיפוש הקהילה לפי הקוד
        const { data: community, error: communityError } = await supabase
          .from('communities')
          .select('id, name')
          .eq('platform_id', messageText)
          .single();

        if (communityError || !community) {
          console.error('Community not found by code:', communityError);
          await sendTelegramMessage(BOT_TOKEN, chatId, "קוד הקהילה לא נמצא. אנא בדקו את הקוד ונסו שוב.");
          return new Response(JSON.stringify({ success: true }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
          });
        }

        console.log('Found community by code:', community);

        // יצירת לינק למיני אפליקציה - שימו לב לפורמט החדש
        const miniAppUrl = `https://t.me/membifybot/app?startapp=${encodeURIComponent(community.id)}`;
        
        // שליחת הודעה עם כפתור שמוביל למיני אפליקציה
        const message = `
ברוכים הבאים לקהילת ${community.name}! 
לחצו על הכפתור למטה כדי להצטרף לקהילה 👇
        `;

        const replyMarkup = {
          inline_keyboard: [[
            {
              text: "הצטרפו לקהילה 🚀",
              url: miniAppUrl
            }
          ]]
        };

        console.log('Sending welcome message with mini app button, URL:', miniAppUrl);
        const result = await sendTelegramMessageWithMarkup(BOT_TOKEN, chatId, message, replyMarkup);
        console.log('Message sent result:', result);
      }

      // Handle verification messages (either from regular message or channel post)
      const verificationMessage = update.message?.text || update.channel_post?.text;
      const verificationChatId = update.message?.chat.id || update.channel_post?.chat.id;
      const messageId = update.message?.message_id || update.channel_post?.message_id;
      const chatType = update.message?.chat.type || update.channel_post?.chat.type;
      const chatTitle = update.message?.chat.title || update.channel_post?.chat.title;

      if (verificationMessage?.startsWith('MBF_') && verificationChatId && messageId) {
        console.log(`🔑 Processing verification code ${verificationMessage} for chat ${verificationChatId}`);
        
        // Find profile with this verification code
        const { data: profiles, error: profileError } = await supabase
          .from('profiles')
          .select('id')
          .eq('current_telegram_code', verificationMessage.trim())
          .limit(1);

        if (profileError || !profiles?.length) {
          console.error('❌ Error finding profile:', profileError);
          return new Response(
            JSON.stringify({ error: 'Failed to find profile' }),
            {
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
              status: 500,
            }
          );
        }

        const userId = profiles[0].id;

        // Create community
        const { data: community, error: communityError } = await supabase
          .from('communities')
          .insert({
            owner_id: userId,
            platform: 'telegram',
            name: chatTitle || 'My Telegram Community',
            platform_id: chatId.toString(),
            telegram_chat_id: chatId.toString()
          })
          .select()
          .single();

        if (communityError) {
          console.error('❌ Error creating community:', communityError);
          return new Response(
            JSON.stringify({ error: 'Failed to create community' }),
            {
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
              status: 500,
            }
          );
        }

        // Set up and verify bot settings
        const { error: botSettingsError } = await supabase
          .from('telegram_bot_settings')
          .insert({
            community_id: community.id,
            chat_id: chatId.toString(),
            verification_code: verificationMessage.trim(),
            verified_at: new Date().toISOString(),
            is_admin: true
          });

        if (botSettingsError) {
          console.error('❌ Error creating bot settings:', botSettingsError);
          return new Response(
            JSON.stringify({ error: 'Failed to create bot settings' }),
            {
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
              status: 500,
            }
          );
        }

        // Delete the verification message
        const deleteResult = await deleteTelegramMessage(BOT_TOKEN, chatId, messageId);
        console.log('🗑️ Delete message result:', deleteResult);

        // Send success message
        const successMessage = chatType === 'channel' 
          ? "✅ Verification successful! Your Telegram channel is now connected to Membify."
          : "✅ Verification successful! Your Telegram group is now connected to Membify.";
        
        const messageResult = await sendTelegramMessage(BOT_TOKEN, chatId, successMessage);
        console.log('✉️ Success message result:', messageResult);
        
        return new Response(JSON.stringify({ success: true }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        });
      }

      // Handle bot being added to a group
      if (update.my_chat_member?.new_chat_member.status === 'administrator') {
        const chatId = update.my_chat_member.chat.id;
        const chatType = update.my_chat_member.chat.type;
        console.log(`👋 Bot added as admin to ${chatType} ${chatId}`);
        
        const welcomeMessage = chatType === 'channel'
          ? "Thank you for adding me as an admin! Please paste the verification code to connect this channel to your Membify account."
          : "Thank you for adding me as an admin! Please paste the verification code to connect this group to your Membify account.";
        
        const messageResult = await sendTelegramMessage(BOT_TOKEN, chatId, welcomeMessage);
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

// Helper functions
async function sendTelegramMessage(token: string, chatId: number, text: string) {
  const url = `https://api.telegram.org/bot${token}/sendMessage`
  console.log('Sending telegram message:', { chatId, text });
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
  
  const result = await response.json();
  console.log('Telegram API response:', result);
  return result;
}

async function sendTelegramMessageWithMarkup(token: string, chatId: number, text: string, reply_markup: any) {
  const url = `https://api.telegram.org/bot${token}/sendMessage`
  console.log('Sending telegram message with markup:', { chatId, text, reply_markup });
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      chat_id: chatId,
      text: text,
      reply_markup: reply_markup,
      parse_mode: 'HTML'
    }),
  })
  
  const result = await response.json();
  console.log('Telegram API response:', result);
  return result;
}

async function deleteTelegramMessage(token: string, chatId: number, messageId: number) {
  const url = `https://api.telegram.org/bot${token}/deleteMessage`
  console.log('Deleting telegram message:', { chatId, messageId });
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
  
  const result = await response.json();
  console.log('Telegram API response:', result);
  return result;
}
