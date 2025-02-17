
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { getBotSettings } from '../botSettingsHandler.ts';
import { findCommunityById } from '../communityHandler.ts';

export async function handleStartCommand(
  supabase: ReturnType<typeof createClient>,
  message: any,
  botToken: string
): Promise<boolean> {
  try {
    console.log('[Start] Processing start command:', { message });
    
    const communityId = message.text.split(' ')[1];
    if (!communityId || !message.from) {
      console.log('[Start] Missing required data:', { communityId, from: message.from });
      return false;
    }

    console.log('[Start] Fetching community and bot settings...');
    const [community, botSettings] = await Promise.all([
      findCommunityById(supabase, communityId),
      getBotSettings(supabase, communityId)
    ]);

    if (!community) {
      console.log('[Start] Community not found:', communityId);
      return false;
    }

    if (!botSettings) {
      console.log('[Start] Bot settings not found for community:', communityId);
      return false;
    }

    console.log('[Start] Found community and settings:', { 
      communityName: community.name,
      hasWelcomeMessage: !!botSettings.welcome_message 
    });

    const miniAppUrl = `https://preview--subscribely-serenity.lovable.app/telegram-mini-app`;
    const welcomeMessage = botSettings.welcome_message || 
      `ברוכים הבאים ל-${community.name}! 🎉\nלחצו על הכפתור למטה כדי להצטרף:`;

    console.log('[Start] Sending welcome message to:', message.from.id);
    console.log('[Start] Message content:', welcomeMessage);

    try {
      const response = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: message.from.id,
          text: welcomeMessage,
          parse_mode: 'HTML',
          reply_markup: {
            inline_keyboard: [[
              {
                text: "Join Community 🚀",
                web_app: { url: `${miniAppUrl}?start=${communityId}` }
              }
            ]]
          }
        })
      });

      const result = await response.json();
      console.log('[Start] Telegram API response:', result);

      if (!result.ok) {
        console.error('[Start] Telegram API error:', result.description);
        return false;
      }

      // מעקב אחר המשתמש בדאטהבייס
      console.log('[Start] Recording user interaction...');
      await supabase
        .from('telegram_events')
        .insert({
          event_type: 'start_command',
          user_id: String(message.from.id),
          username: message.from.username,
          message_text: message.text,
          raw_data: message
        });

      return true;
    } catch (sendError) {
      console.error('[Start] Error sending message:', sendError);
      return false;
    }
  } catch (error) {
    console.error('[Start] Critical error:', error);
    return false;
  }
}
