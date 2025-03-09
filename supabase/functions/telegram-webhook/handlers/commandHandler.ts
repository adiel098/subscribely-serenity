
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { getBotSettings } from '../botSettingsHandler.ts';
import { findCommunityById } from '../communityHandler.ts';

export async function handleStartCommand(
  supabase: ReturnType<typeof createClient>, 
  message: any, 
  botToken: string
) {
  try {
    const communityIdOrLink = message.text.split(' ')[1];
    if (!communityIdOrLink || !message.from) {
      console.log('Missing community ID/link or sender info');
      return;
    }

    // Check if it's a UUID or a custom link
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(communityIdOrLink);
    let communityId = communityIdOrLink;

    // If not a UUID, try to find by custom_link
    if (!isUUID) {
      const { data, error } = await supabase
        .from('communities')
        .select('id')
        .eq('custom_link', communityIdOrLink)
        .single();
        
      if (error || !data) {
        console.log('Community not found with custom link:', communityIdOrLink);
        return;
      }
      
      communityId = data.id;
      console.log('Resolved custom link to community ID:', communityId);
    }

    const [community, botSettings] = await Promise.all([
      findCommunityById(supabase, communityId),
      getBotSettings(supabase, communityId)
    ]);

    if (!community || !botSettings) {
      console.log('Community or bot settings not found');
      return;
    }

    console.log('Sending welcome message to user:', message.from.id);
    
    const miniAppUrl = `https://preview--subscribely-serenity.lovable.app/telegram-mini-app`;
    const welcomeMessage = botSettings.welcome_message || 
      `ברוכים הבאים ל-${community.name}! 🎉\nלחצו על הכפתור למטה כדי להצטרף:`;

    await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: message.from.id,
        text: welcomeMessage,
        reply_markup: {
          inline_keyboard: [[
            {
              text: "Join Community🚀",
              web_app: { url: `${miniAppUrl}?start=${communityId}` }
            }
          ]]
        }
      })
    });
  } catch (error) {
    console.error('Error handling start command:', error);
    throw error;
  }
}
