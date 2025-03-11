
/**
 * Utility for sending messages through the Telegram Bot API
 */

/**
 * Send a message to a Telegram chat
 * @param botToken Telegram Bot API token
 * @param chatId The target chat ID
 * @param text Message text
 * @param photoUrl Optional URL to a photo to include with the message
 * @param replyMarkup Optional inline keyboard markup
 * @returns The API response
 */
export async function sendTelegramMessage(
  botToken: string,
  chatId: number | string,
  text: string,
  photoUrl: string | null = null,
  replyMarkup: any = null
): Promise<any> {
  console.log(`[TELEGRAM-MESSENGER] 📤 Sending message to chat ${chatId}`);
  console.log(`[TELEGRAM-MESSENGER] 💬 Message text: ${text}`);
  console.log(`[TELEGRAM-MESSENGER] 🖼️ Photo URL: ${photoUrl || 'No photo'}`);
  console.log(`[TELEGRAM-MESSENGER] ⌨️ Reply markup: ${replyMarkup ? JSON.stringify(replyMarkup) : 'None'}`);
  
  try {
    // Different endpoint based on whether we have a photo
    const endpoint = photoUrl
      ? 'sendPhoto'
      : 'sendMessage';
    
    console.log(`[TELEGRAM-MESSENGER] 🎯 Using endpoint: ${endpoint}`);
    
    // Prepare the payload
    const payload: any = {
      chat_id: chatId,
      parse_mode: 'HTML',
      disable_web_page_preview: true,
    };
    
    if (photoUrl) {
      payload.photo = photoUrl;
      payload.caption = text;
    } else {
      payload.text = text;
    }
    
    if (replyMarkup) {
      payload.reply_markup = typeof replyMarkup === 'string'
        ? replyMarkup
        : JSON.stringify(replyMarkup);
    }
    
    console.log(`[TELEGRAM-MESSENGER] 📦 Request payload:`, JSON.stringify(payload, null, 2));
    
    // Make the API request
    const apiUrl = `https://api.telegram.org/bot${botToken}/${endpoint}`;
    console.log(`[TELEGRAM-MESSENGER] 🔗 Making request to: ${apiUrl}`);
    
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
    
    // Parse the response
    const result = await response.json();
    console.log(`[TELEGRAM-MESSENGER] 📥 Telegram API Response:`, JSON.stringify(result, null, 2));
    
    if (!result.ok) {
      console.error(`[TELEGRAM-MESSENGER] ❌ Error from Telegram API: ${result.description}`);
      throw new Error(`Telegram API error: ${result.description}`);
    }
    
    console.log(`[TELEGRAM-MESSENGER] ✅ Message sent successfully to chat ${chatId}`);
    return result;
  } catch (error) {
    console.error(`[TELEGRAM-MESSENGER] ❌ Error sending message:`, error);
    throw error;
  }
}

export async function getChat(botToken: string, chatId: number | string) {
  try {
    console.log(`[TELEGRAM-MESSENGER] 🔍 Getting chat info for chat ID: ${chatId}`);
    
    const apiUrl = `https://api.telegram.org/bot${botToken}/getChat`;
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ chat_id: chatId }),
    });
    
    const result = await response.json();
    
    if (!result.ok) {
      console.error(`[TELEGRAM-MESSENGER] ❌ Error getting chat: ${result.description}`);
      throw new Error(`Telegram API error: ${result.description}`);
    }
    
    console.log(`[TELEGRAM-MESSENGER] ✅ Got chat info for chat ${chatId}:`, JSON.stringify(result.result, null, 2));
    return result.result;
  } catch (error) {
    console.error(`[TELEGRAM-MESSENGER] ❌ Error in getChat:`, error);
    throw error;
  }
}
