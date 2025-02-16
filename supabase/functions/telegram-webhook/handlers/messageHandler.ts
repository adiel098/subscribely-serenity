
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { logTelegramEvent } from '../eventLogger.ts';
import { getBotSettings } from '../botSettingsHandler.ts';
import { findCommunityById } from '../communityHandler.ts';

export async function handleNewMessage(supabase: ReturnType<typeof createClient>, update: any, context: { BOT_TOKEN: string }) {
  try {
    console.log('🗨️ Processing new message:', JSON.stringify(update.message, null, 2));
    
    const message = update.message;
    if (message?.text?.startsWith('/start')) {
      console.log('Processing /start command');
      const communityId = message.text.split(' ')[1];
      
      if (communityId) {
        // Get bot token from settings
        const { data: settings } = await supabase
          .from('telegram_global_settings')
          .select('bot_token')
          .single();

        if (!settings?.bot_token) {
          throw new Error('Bot token not found in settings');
        }

        const [community, botSettings] = await Promise.all([
          findCommunityById(supabase, communityId),
          getBotSettings(supabase, communityId)
        ]);

        console.log('Found community:', community);
        console.log('Bot settings:', botSettings);
        
        const miniAppUrl = `https://preview--subscribely-serenity.lovable.app/telegram-mini-app`;

        // שימוש בהודעת הברוכים הבאים המותאמת אישית
        const welcomeMessage = botSettings.welcome_message || `ברוכים הבאים ל-${community.name}! 🎉\nלחצו על הכפתור למטה כדי להצטרף:`;
        
        const response = await fetch(`https://api.telegram.org/bot${settings.bot_token}/sendMessage`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            chat_id: message.chat.id,
            text: welcomeMessage,
            reply_markup: {
              inline_keyboard: [[
                {
                  text: "הצטרפות לקהילה 🚀",
                  web_app: {
                    url: `${miniAppUrl}?start=${communityId}`
                  }
                }
              ]]
            }
          })
        });

        const result = await response.json();
        console.log('Telegram API response:', result);
      }
    }
    
    await logTelegramEvent(supabase, 'new_message', update);
  } catch (error) {
    console.error('Error in handleNewMessage:', error);
    throw error;
  }
}

export async function handleEditedMessage(supabase: ReturnType<typeof createClient>, update: any) {
  try {
    console.log('✏️ Processing edited message:', JSON.stringify(update.edited_message, null, 2));
    await logTelegramEvent(supabase, 'edited_message', update);
  } catch (error) {
    console.error('Error in handleEditedMessage:', error);
    throw error;
  }
}

export async function handleChannelPost(supabase: ReturnType<typeof createClient>, update: any) {
  try {
    console.log('📢 Processing channel post:', JSON.stringify(update.channel_post, null, 2));
    await logTelegramEvent(supabase, 'channel_post', update);
  } catch (error) {
    console.error('Error in handleChannelPost:', error);
    throw error;
  }
}
