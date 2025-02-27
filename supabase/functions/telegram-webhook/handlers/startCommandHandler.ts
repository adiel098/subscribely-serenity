
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { getBotSettings } from '../botSettingsHandler.ts';
import { findCommunityById } from '../communityHandler.ts';

export async function handleStartCommand(
  supabase: ReturnType<typeof createClient>,
  message: any,
  botToken: string
): Promise<boolean> {
  try {
    console.log('[Start] Processing start command:', { 
      message,
      hasBotToken: !!botToken,
      botTokenLength: botToken?.length
    });
    
    if (!botToken) {
      console.error('[Start] Bot token is missing!');
      return false;
    }

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
      hasWelcomeMessage: !!botSettings.welcome_message,
      hasWelcomeImage: !!botSettings.welcome_image
    });

    // נוודא שיש לנו טוקן תקין ע"י בדיקה מול טלגרם
    console.log('[Start] Verifying bot token...');
    try {
      const verifyResponse = await fetch(`https://api.telegram.org/bot${botToken}/getMe`);
      const verifyResult = await verifyResponse.json();
      if (!verifyResult.ok) {
        console.error('[Start] Invalid bot token:', verifyResult);
        return false;
      }
      console.log('[Start] Bot token verified successfully:', verifyResult.result.username);
    } catch (verifyError) {
      console.error('[Start] Error verifying bot token:', verifyError);
      return false;
    }

    const miniAppUrl = `https://preview--subscribely-serenity.lovable.app/telegram-mini-app`;
    const welcomeMessage = botSettings.welcome_message || 
      `ברוכים הבאים ל-${community.name}! 🎉\nלחצו על הכפתור למטה כדי להצטרף:`;

    console.log('[Start] Sending welcome message to:', message.from.id);
    console.log('[Start] Message content:', welcomeMessage);
    console.log('[Start] Using bot API URL:', `https://api.telegram.org/bot${botToken.substring(0, 5)}...`);

    try {
      // Check if we have a welcome image to send
      if (botSettings.welcome_image) {
        console.log('[Start] Welcome image found, sending as photo with caption');
        
        // Send image with caption and inline keyboard
        const response = await fetch(`https://api.telegram.org/bot${botToken}/sendPhoto`, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'User-Agent': 'Subscribely-Bot/1.0'
          },
          body: JSON.stringify({
            chat_id: message.from.id,
            photo: botSettings.welcome_image,
            caption: welcomeMessage,
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
        
        const responseText = await response.text();
        console.log('[Start] Raw API response for image message:', responseText);
        
        let result;
        try {
          result = JSON.parse(responseText);
        } catch (parseError) {
          console.error('[Start] Error parsing photo API response:', parseError);
          return false;
        }
        
        console.log('[Start] Telegram photo API response:', result);
        
        if (!result.ok) {
          console.error('[Start] Telegram photo API error:', result.description);
          // Fall back to text-only message if photo sending fails
          console.log('[Start] Falling back to text-only message');
          return await sendTextOnlyMessage(botToken, message.from.id, welcomeMessage, miniAppUrl, communityId);
        }
      } else {
        // No image, send text-only message
        console.log('[Start] No welcome image, sending text-only message');
        return await sendTextOnlyMessage(botToken, message.from.id, welcomeMessage, miniAppUrl, communityId);
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

// Helper function to send text-only welcome message
async function sendTextOnlyMessage(
  botToken: string, 
  chatId: number, 
  welcomeMessage: string, 
  miniAppUrl: string, 
  communityId: string
): Promise<boolean> {
  try {
    const response = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'User-Agent': 'Subscribely-Bot/1.0'
      },
      body: JSON.stringify({
        chat_id: chatId,
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

    const responseText = await response.text();
    console.log('[Start] Raw API response for text message:', responseText);

    let result;
    try {
      result = JSON.parse(responseText);
    } catch (parseError) {
      console.error('[Start] Error parsing text API response:', parseError);
      return false;
    }

    console.log('[Start] Telegram text API response:', result);

    if (!result.ok) {
      console.error('[Start] Telegram text API error:', result.description);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('[Start] Error sending text message:', error);
    return false;
  }
}
