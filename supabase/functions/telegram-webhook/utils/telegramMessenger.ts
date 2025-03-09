
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

/**
 * Send a message to a Telegram chat with optional photo and inline keyboard
 */
export async function sendTelegramMessage(
  botToken: string,
  chatId: number | string,
  message: string,
  photoUrl: string | null = null,
  inlineKeyboard: any = null
): Promise<any> {
  try {
    console.log(`[TELEGRAM-MESSENGER] 📤 Sending ${photoUrl ? 'photo with caption' : 'text'} to chat ${chatId}`);
    
    // Validate bot token
    if (!botToken || typeof botToken !== 'string' || botToken.length < 10) {
      console.error('[TELEGRAM-MESSENGER] ❌ Invalid bot token provided');
      throw new Error('Invalid bot token');
    }
    
    // Prepare the request based on whether we're sending a photo or text
    let url: string;
    let body: any;
    
    if (photoUrl) {
      url = `https://api.telegram.org/bot${botToken}/sendPhoto`;
      body = {
        chat_id: chatId,
        photo: photoUrl,
        caption: message,
        parse_mode: 'HTML'
      };
      
      if (inlineKeyboard) {
        body.reply_markup = inlineKeyboard;
      }
    } else {
      url = `https://api.telegram.org/bot${botToken}/sendMessage`;
      body = {
        chat_id: chatId,
        text: message,
        parse_mode: 'HTML'
      };
      
      if (inlineKeyboard) {
        body.reply_markup = inlineKeyboard;
      }
    }
    
    // Send the request to the Telegram API
    console.log(`[TELEGRAM-MESSENGER] 🔄 Calling Telegram API: ${url}`);
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    });
    
    // Parse and validate the response
    const result = await response.json();
    console.log(`[TELEGRAM-MESSENGER] ✅ Telegram API response status: ${result.ok ? 'Success' : 'Failure'}`);
    
    if (!result.ok) {
      console.error(`[TELEGRAM-MESSENGER] ❌ Error sending message: ${result.description}`);
    }
    
    return result;
  } catch (error) {
    console.error('[TELEGRAM-MESSENGER] ❌ Exception in sendTelegramMessage:', error);
    return {
      ok: false,
      description: `Error sending message: ${error.message || 'Unknown error'}`
    };
  }
}

/**
 * Verify that a Telegram chat exists and the bot can access it
 */
export async function verifyTelegramChat(
  botToken: string,
  chatId: number | string
): Promise<boolean> {
  try {
    console.log(`[TELEGRAM-MESSENGER] 🔍 Verifying chat ${chatId}`);
    
    const url = `https://api.telegram.org/bot${botToken}/getChat`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ chat_id: chatId })
    });
    
    const result = await response.json();
    console.log(`[TELEGRAM-MESSENGER] ✅ Chat verification result: ${result.ok ? 'Valid' : 'Invalid'}`);
    
    return result.ok;
  } catch (error) {
    console.error('[TELEGRAM-MESSENGER] ❌ Error verifying chat:', error);
    return false;
  }
}
