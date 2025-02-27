
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

/**
 * Sends a text message via Telegram API
 */
export async function sendTextMessage(
  botToken: string, 
  chatId: number, 
  welcomeMessage: string, 
  miniAppUrl: string, 
  communityId: string
): Promise<boolean> {
  try {
    console.log('[MessageSender] Sending text message to:', chatId);
    
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
    console.log('[MessageSender] Raw API response for text message:', responseText);

    let result;
    try {
      result = JSON.parse(responseText);
    } catch (parseError) {
      console.error('[MessageSender] Error parsing text API response:', parseError);
      return false;
    }

    console.log('[MessageSender] Telegram text API response:', result);

    if (!result.ok) {
      console.error('[MessageSender] Telegram text API error:', result.description);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('[MessageSender] Error sending text message:', error);
    return false;
  }
}

/**
 * Sends a photo with caption via Telegram API
 */
export async function sendPhotoMessage(
  botToken: string,
  chatId: number,
  photoUrl: string,
  caption: string,
  miniAppUrl: string,
  communityId: string
): Promise<boolean> {
  try {
    console.log('[MessageSender] Sending photo message to:', chatId);
    
    const response = await fetch(`https://api.telegram.org/bot${botToken}/sendPhoto`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'User-Agent': 'Subscribely-Bot/1.0'
      },
      body: JSON.stringify({
        chat_id: chatId,
        photo: photoUrl,
        caption: caption,
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
    console.log('[MessageSender] Raw API response for photo message:', responseText);
    
    let result;
    try {
      result = JSON.parse(responseText);
    } catch (parseError) {
      console.error('[MessageSender] Error parsing photo API response:', parseError);
      return false;
    }
    
    console.log('[MessageSender] Telegram photo API response:', result);
    
    if (!result.ok) {
      console.error('[MessageSender] Telegram photo API error:', result.description);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('[MessageSender] Error sending photo message:', error);
    return false;
  }
}

/**
 * Verifies that the bot token is valid by making a request to Telegram API
 */
export async function verifyBotToken(botToken: string): Promise<boolean> {
  try {
    console.log('[MessageSender] Verifying bot token...');
    const verifyResponse = await fetch(`https://api.telegram.org/bot${botToken}/getMe`);
    const verifyResult = await verifyResponse.json();
    
    if (!verifyResult.ok) {
      console.error('[MessageSender] Invalid bot token:', verifyResult);
      return false;
    }
    
    console.log('[MessageSender] Bot token verified successfully:', verifyResult.result.username);
    return true;
  } catch (verifyError) {
    console.error('[MessageSender] Error verifying bot token:', verifyError);
    return false;
  }
}
