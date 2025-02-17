
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { getBotSettings } from '../botSettingsHandler.ts';
import { findCommunityById } from '../communityHandler.ts';

export async function handleStartCommand(
  supabase: ReturnType<typeof createClient>,
  message: any,
  botToken: string
): Promise<boolean> {
  try {
    const communityId = message.text.split(' ')[1];
    if (!communityId || !message.from) {
      return false;
    }

    const [community, botSettings] = await Promise.all([
      findCommunityById(supabase, communityId),
      getBotSettings(supabase, communityId)
    ]);

    if (!community || !botSettings) {
      return false;
    }

    const miniAppUrl = `https://preview--subscribely-serenity.lovable.app/telegram-mini-app`;
    const welcomeMessage = botSettings.welcome_message || 
      `ברוכים הבאים ל-${community.name}! 🎉\nלחצו על הכפתור למטה כדי להצטרף:`;

    const response = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: message.from.id,
        text: welcomeMessage,
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
    return result.ok;
  } catch (error) {
    console.error('[Start] Error:', error);
    return false;
  }
}
