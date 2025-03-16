/**
 * Utility for sending messages through the Telegram Bot API
 */

/**
 * Send a message to a Telegram chat
 * @param botToken Telegram Bot API token
 * @param chatId The target chat ID
 * @param text Message text
 * @param replyMarkup Optional inline keyboard markup or photo URL
 * @param photoUrl Optional URL to a photo to include with the message
 * @returns The API response
 */
export async function sendTelegramMessage(
  botToken: string,
  chatId: number | string,
  text: string,
  replyMarkup: any = null,
  photoUrl: string | null = null
): Promise<any> {
  console.log(`[TELEGRAM-MESSENGER] 📤 Sending message to chat ${chatId}`);
  console.log(`[TELEGRAM-MESSENGER] 💬 Message text: ${text}`);
  console.log(`[TELEGRAM-MESSENGER] 🖼️ Photo URL: ${photoUrl ? 'Provided' : 'None'}`);
  console.log(`[TELEGRAM-MESSENGER] ⌨️ Reply markup: ${replyMarkup ? JSON.stringify(replyMarkup) : 'None'}`);
  
  try {
    // If photo is provided, send a photo message
    if (photoUrl) {
      return await sendPhotoMessage(botToken, chatId, photoUrl, text, replyMarkup);
    }
    
    // Otherwise send a text message
    // Prepare the payload
    const payload: any = {
      chat_id: chatId,
      text: text,
      parse_mode: 'HTML',
      disable_web_page_preview: true,
    };
    
    // Make sure we're not double-stringifying the reply markup
    if (replyMarkup) {
      payload.reply_markup = typeof replyMarkup === 'string'
        ? replyMarkup
        : JSON.stringify(replyMarkup);
    }
    
    console.log(`[TELEGRAM-MESSENGER] 📦 Request payload:`, JSON.stringify(payload, null, 2));
    
    // Make the API request
    const apiUrl = `https://api.telegram.org/bot${botToken}/sendMessage`;
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

/**
 * Send a photo message with caption
 * @param botToken Telegram Bot API token
 * @param chatId The target chat ID
 * @param photoUrl URL to a photo to include with the message
 * @param caption Optional caption text for the photo
 * @param replyMarkup Optional inline keyboard markup
 * @returns The API response
 */
async function sendPhotoMessage(
  botToken: string,
  chatId: number | string,
  photoUrl: string,
  caption: string = "",
  replyMarkup: any = null
): Promise<any> {
  try {
    // Prepare the payload
    const payload: any = {
      chat_id: chatId,
      photo: photoUrl,
      parse_mode: 'HTML',
    };
    
    if (caption && caption.trim() !== '') {
      payload.caption = caption;
    }
    
    // Make sure we're not double-stringifying the reply markup
    if (replyMarkup) {
      payload.reply_markup = typeof replyMarkup === 'string'
        ? replyMarkup
        : JSON.stringify(replyMarkup);
    }
    
    console.log(`[TELEGRAM-MESSENGER] 📦 Photo message payload:`, JSON.stringify(payload, null, 2));
    
    // Make the API request
    const apiUrl = `https://api.telegram.org/bot${botToken}/sendPhoto`;
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
    
    console.log(`[TELEGRAM-MESSENGER] ✅ Photo message sent successfully to chat ${chatId}`);
    return result;
  } catch (error) {
    console.error(`[TELEGRAM-MESSENGER] ❌ Error sending photo message:`, error);
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
