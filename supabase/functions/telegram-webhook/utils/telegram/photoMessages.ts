
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
    // Not a URL - could be a file ID
    // Telegram file IDs are usually alphanumeric strings
    return /^[a-zA-Z0-9_-]{5,}$/.test(source);
  }
}

/**
 * Preprocesses an image source for Telegram API compatibility
 * Handles data URLs properly to ensure valid encoding
 */
function preprocessImageSource(source: string): string {
  // If it's a data URL, ensure proper formatting
  if (source.startsWith('data:image/')) {
    try {
      // Extract MIME type and base64 data
      const [prefix, base64Data] = source.split(',');
      
      if (!base64Data) {
        console.error('[TELEGRAM-PHOTO-PREPROCESS] Invalid data URL format');
        return ''; // Return empty to fail validation
      }
      
      // Remove spaces and line breaks that might exist in the base64 string
      const cleanedData = base64Data.replace(/\s/g, '');
      
      // Ensure the base64 data has proper padding
      const paddingNeeded = (4 - (cleanedData.length % 4)) % 4;
      const paddedData = cleanedData + '='.repeat(paddingNeeded);
      
      return `${prefix},${paddedData}`;
    } catch (error) {
      console.error('[TELEGRAM-PHOTO-PREPROCESS] Error processing data URL:', error);
      return ''; // Return empty to fail validation
    }
  }
  
  // For regular URLs or file IDs, return as is
  return source;
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
    // First validate and preprocess the photo source
    if (!photoUrl) {
      console.log(`[TELEGRAM-PHOTO] No photo source provided, falling back to text message`);
      return await sendTextFallback(botToken, chatId, caption, replyMarkup);
    }
    
    // Preprocess the image source to ensure compatibility with Telegram API
    const processedPhotoUrl = preprocessImageSource(photoUrl);
    
    if (!processedPhotoUrl || !isValidPhotoSource(processedPhotoUrl)) {
      console.log(`[TELEGRAM-PHOTO] Invalid photo source after preprocessing, falling back to text message`);
      return await sendTextFallback(botToken, chatId, caption, replyMarkup);
    }
    
    console.log(`[TELEGRAM-PHOTO] Sending photo to ${chatId}`);
    
    // For logging, truncate the URL to avoid huge logs
    const loggablePhotoUrl = typeof processedPhotoUrl === 'string' 
      ? (processedPhotoUrl.startsWith('data:') 
          ? processedPhotoUrl.substring(0, 30) + '...[base64 data]' 
          : processedPhotoUrl) 
      : 'null';
    console.log(`[TELEGRAM-PHOTO] Photo source type: ${processedPhotoUrl.startsWith('data:') ? 'Data URL' : 'URL/File ID'}`);
    console.log(`[TELEGRAM-PHOTO] Photo source: ${loggablePhotoUrl}`);
    
    // Prepare the message data
    const messageData: any = {
      chat_id: chatId,
      photo: processedPhotoUrl,
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
    
    // Attempt to determine if we're dealing with a data URL that should be sent as a file
    // Data URLs over a certain length may need to be uploaded as multipart/form-data
    if (processedPhotoUrl.startsWith('data:image/') && processedPhotoUrl.length > 10000) {
      console.log('[TELEGRAM-PHOTO] Large data URL detected, may require special handling');
      // For very large data URLs, we might need to use a different approach,
      // but for now we'll try the standard method
    }
    
    // Send the message
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
      
      // If we get a specific error about the image format, try to extract more information
      if (data.description && data.description.includes('wrong remote file identifier')) {
        console.error(`[TELEGRAM-PHOTO] Image format error details: ${data.description}`);
        console.error(`[TELEGRAM-PHOTO] This typically indicates an issue with the image format or encoding`);
      }
      
      // Fall back to sending a text-only message
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
