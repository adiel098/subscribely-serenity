
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
  console.log(`[TELEGRAM-MESSENGER] 🖼️ Photo URL: ${photoUrl ? (photoUrl.length > 100 ? photoUrl.substring(0, 100) + '...' : photoUrl) : 'None'}`);
  console.log(`[TELEGRAM-MESSENGER] ⌨️ Reply markup: ${replyMarkup ? JSON.stringify(replyMarkup) : 'None'}`);
  
  try {
    // Validate photoUrl if provided
    if (photoUrl) {
      // Check if it's a valid URL or base64 image
      if (!isValidImageUrl(photoUrl)) {
        console.log(`[TELEGRAM-MESSENGER] ⚠️ Invalid photo URL format, falling back to text-only message`);
        photoUrl = null; // Reset to null to send text-only message
      }
    }
    
    // If photo is provided and valid, send a photo message
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
    // Double-check photoUrl is valid before attempting to send
    if (!isValidImageUrl(photoUrl)) {
      console.error(`[TELEGRAM-MESSENGER] ❌ Invalid photo URL format: ${photoUrl.substring(0, 30)}...`);
      throw new Error(`Invalid photo URL format`);
    }
    
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
      
      // If there's an error with the photo, fall back to text-only message
      if (result.description && (
        result.description.includes("wrong remote file identifier") || 
        result.description.includes("Wrong character") ||
        result.description.includes("Bad Request") ||
        result.description.includes("PHOTO_INVALID_DIMENSIONS")
      )) {
        console.log(`[TELEGRAM-MESSENGER] ⚠️ Image error detected, falling back to text-only message`);
        return await sendTelegramMessage(botToken, chatId, caption || "Message with image", replyMarkup, null);
      }
      
      throw new Error(`Telegram API error: ${result.description}`);
    }
    
    console.log(`[TELEGRAM-MESSENGER] ✅ Photo message sent successfully to chat ${chatId}`);
    return result;
  } catch (error) {
    console.error(`[TELEGRAM-MESSENGER] ❌ Error sending photo message:`, error);
    
    // For any unexpected error, try to fall back to text-only message
    try {
      console.log(`[TELEGRAM-MESSENGER] 🔄 Falling back to text-only message after error`);
      return await sendTelegramMessage(botToken, chatId, caption || "Message with image", replyMarkup, null);
    } catch (fallbackError) {
      console.error(`[TELEGRAM-MESSENGER] ❌ Even fallback message failed:`, fallbackError);
      throw error; // Rethrow the original error
    }
  }
}

/**
 * Check if a Chat ID exists and is valid for messaging
 */
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

/**
 * Validate if a string is a valid image URL for Telegram
 * @param url The URL to validate
 */
function isValidImageUrl(url: string): boolean {
  // Check if it's a base64 data URL for an image
  if (url.startsWith('data:image/')) {
    return true;
  }
  
  // Check if it's a URL (very basic validation)
  try {
    // Check if it's a valid URL format
    new URL(url);
    
    // Must be HTTPS for Telegram API
    if (!url.startsWith('https://')) {
      console.log(`[TELEGRAM-MESSENGER] ⚠️ URL must start with HTTPS: ${url.substring(0, 30)}...`);
      return false;
    }
    
    // Check for common image extensions or Telegram file URLs
    const validPatterns = [
      /\.(jpeg|jpg|png|gif|webp)$/i, // Common image extensions
      /api\.telegram\.org\/file\/bot/i, // Telegram file URL pattern
    ];
    
    const isValidPattern = validPatterns.some(pattern => pattern.test(url));
    
    // If URL doesn't match patterns, log but still return true as Telegram might accept it
    if (!isValidPattern) {
      console.log(`[TELEGRAM-MESSENGER] ⚠️ URL doesn't match common image patterns: ${url.substring(0, 30)}...`);
    }
    
    return true;
  } catch (e) {
    console.log(`[TELEGRAM-MESSENGER] ⚠️ Invalid URL format: ${url.substring(0, 30)}...`);
    return false;
  }
}
