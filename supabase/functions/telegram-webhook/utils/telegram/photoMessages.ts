
/**
 * Functions for sending photo messages via Telegram Bot API
 */

/**
 * Validates if a string is a valid image URL or file ID
 */
export function isValidPhotoSource(source: string | null): boolean {
  if (!source) return false;
  
  // Check for data URI
  if (source.startsWith('data:image/')) {
    return true;
  }
  
  // Check for URL
  try {
    const url = new URL(source);
    return url.protocol === 'https:' || url.protocol === 'http:';
  } catch (e) {
    // Not a URL - could be a file ID or invalid
    return source.length > 8; // Basic length check for file IDs
  }
}

/**
 * Sends a photo with an optional caption to a Telegram user
 */
export async function sendPhotoWithCaption(
  botToken: string,
  chatId: string | number,
  photoUrl: string | null,
  caption: string | null = null,
  replyMarkup: any = null
): Promise<{ ok: boolean; description?: string; result?: any }> {
  try {
    if (!photoUrl || !isValidPhotoSource(photoUrl)) {
      console.log(`[TELEGRAM-PHOTO] Invalid photo source, falling back to text message`);
      return await sendTextFallback(botToken, chatId, caption, replyMarkup);
    }
    
    console.log(`[TELEGRAM-PHOTO] Sending photo to ${chatId}`);
    console.log(`[TELEGRAM-PHOTO] Photo URL: ${typeof photoUrl === 'string' ? photoUrl.substring(0, 50) + '...' : 'null'}`);
    
    const messageData: any = {
      chat_id: chatId,
      photo: photoUrl,
      parse_mode: 'HTML'
    };
    
    if (caption) {
      messageData.caption = caption;
    }
    
    if (replyMarkup) {
      messageData.reply_markup = typeof replyMarkup === 'string' 
        ? replyMarkup 
        : JSON.stringify(replyMarkup);
    }
    
    const response = await fetch(`https://api.telegram.org/bot${botToken}/sendPhoto`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(messageData)
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      console.error(`[TELEGRAM-PHOTO] ❌ Failed to send photo: ${data.description}`);
      return await sendTextFallback(botToken, chatId, caption, replyMarkup);
    }
    
    console.log(`[TELEGRAM-PHOTO] ✅ Photo sent successfully`);
    return { ok: true, result: data.result };
  } catch (error) {
    console.error(`[TELEGRAM-PHOTO] ❌ Error sending photo:`, error);
    return await sendTextFallback(botToken, chatId, caption, replyMarkup);
  }
}

/**
 * Fall back to sending a text message when photo sending fails
 */
async function sendTextFallback(
  botToken: string,
  chatId: string | number,
  caption: string | null,
  replyMarkup: any
): Promise<{ ok: boolean; description?: string; result?: any }> {
  try {
    console.log(`[TELEGRAM-PHOTO] Falling back to text message`);
    
    const textData: any = {
      chat_id: chatId,
      text: caption || "Message from the community",
      parse_mode: 'HTML',
      disable_web_page_preview: true
    };
    
    if (replyMarkup) {
      textData.reply_markup = typeof replyMarkup === 'string' 
        ? replyMarkup 
        : JSON.stringify(replyMarkup);
    }
    
    const response = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(textData)
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      console.error(`[TELEGRAM-PHOTO] ❌ Fallback message also failed: ${data.description}`);
      return { ok: false, description: `Failed to send photo and fallback message: ${data.description}` };
    }
    
    console.log(`[TELEGRAM-PHOTO] ✅ Fallback message sent successfully`);
    return { ok: true, result: data.result };
  } catch (fallbackError) {
    console.error(`[TELEGRAM-PHOTO] ❌ Fallback also failed:`, fallbackError);
    return { ok: false, description: `Failed to send photo and fallback: ${fallbackError.message}` };
  }
}
