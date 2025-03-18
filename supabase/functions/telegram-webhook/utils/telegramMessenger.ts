
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
  console.log(`[TELEGRAM-MESSENGER] 🖼️ Photo URL present: ${photoUrl ? 'YES' : 'NO'}`);
  
  if (photoUrl) {
    // Log detailed information about the image for debugging
    const imageType = photoUrl.startsWith('data:') 
      ? 'base64' 
      : photoUrl.startsWith('https://') 
        ? 'URL' 
        : 'unknown format';
    console.log(`[TELEGRAM-MESSENGER] 🖼️ Image type: ${imageType}`);
    console.log(`[TELEGRAM-MESSENGER] 🖼️ Image length: ${photoUrl.length} characters`);
    if (photoUrl.length > 20) {
      console.log(`[TELEGRAM-MESSENGER] 🖼️ Image preview: ${photoUrl.substring(0, 20)}...`);
    }
  }
  
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
    console.log(`[TELEGRAM-MESSENGER] 🖼️ Attempting to send photo message to chat ${chatId}`);
    
    // Double-check photoUrl is valid before attempting to send
    if (!isValidImageUrl(photoUrl)) {
      console.error(`[TELEGRAM-MESSENGER] ❌ Invalid photo URL format: ${photoUrl.substring(0, 30)}...`);
      throw new Error(`Invalid photo URL format`);
    }
    
    // Handle base64 image data differently - use FormData for multipart upload
    if (photoUrl.startsWith('data:image/')) {
      console.log(`[TELEGRAM-MESSENGER] 🔄 Detected base64 image, converting to multipart form data`);
      
      // Extract base64 data and mime type
      const matches = photoUrl.match(/^data:(image\/[a-zA-Z+]+);base64,(.+)$/);
      
      if (!matches || matches.length !== 3) {
        console.error(`[TELEGRAM-MESSENGER] ❌ Invalid base64 image format`);
        throw new Error('Invalid base64 image format');
      }
      
      const contentType = matches[1];
      const base64Data = matches[2];
      
      try {
        // Convert base64 to binary
        const binaryString = atob(base64Data);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }
        
        // Create form data
        const formData = new FormData();
        formData.append('chat_id', chatId.toString());
        
        // Create file from binary data
        const blob = new Blob([bytes], { type: contentType });
        formData.append('photo', blob, 'photo.jpg');
        
        if (caption) {
          formData.append('caption', caption);
          formData.append('parse_mode', 'HTML');
        }
        
        if (replyMarkup) {
          const markup = typeof replyMarkup === 'string' ? replyMarkup : JSON.stringify(replyMarkup);
          formData.append('reply_markup', markup);
        }
        
        // Send the multipart request
        const apiUrl = `https://api.telegram.org/bot${botToken}/sendPhoto`;
        console.log(`[TELEGRAM-MESSENGER] 🔗 Making multipart form request to: ${apiUrl}`);
        
        const response = await fetch(apiUrl, {
          method: 'POST',
          body: formData,
        });
        
        const result = await response.json();
        
        console.log(`[TELEGRAM-MESSENGER] 📥 Telegram API Response from multipart upload:`, JSON.stringify(result, null, 2));
        
        if (!result.ok) {
          console.error(`[TELEGRAM-MESSENGER] ❌ Error from Telegram API (multipart): ${result.description}`);
          throw new Error(`Telegram API error: ${result.description}`);
        }
        
        console.log(`[TELEGRAM-MESSENGER] ✅ Base64 photo message sent successfully to chat ${chatId}`);
        return result;
      } catch (error) {
        console.error(`[TELEGRAM-MESSENGER] ❌ Error processing base64 image:`, error);
        throw new Error(`Error processing base64 image: ${error.message}`);
      }
    } else {
      // Handle URL-based images using the standard API
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
      
      console.log(`[TELEGRAM-MESSENGER] 📦 Photo message payload (URL method):`, JSON.stringify(payload, null, 2));
      
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
    }
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
  if (!url) {
    console.log(`[TELEGRAM-MESSENGER] ⚠️ Empty image URL provided`);
    return false;
  }
  
  // Check if it's a base64 data URL for an image
  if (url.startsWith('data:image/')) {
    console.log(`[TELEGRAM-MESSENGER] ✅ Valid base64 image format detected`);
    
    // Validate that it has the correct structure
    const matches = url.match(/^data:image\/[a-zA-Z+]+;base64,/);
    if (!matches) {
      console.log(`[TELEGRAM-MESSENGER] ⚠️ Invalid base64 image prefix: ${url.substring(0, 30)}...`);
      return false;
    }
    
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
    
    console.log(`[TELEGRAM-MESSENGER] ✅ Valid HTTPS URL detected: ${url.substring(0, 30)}...`);
    return true;
  } catch (e) {
    console.log(`[TELEGRAM-MESSENGER] ⚠️ Invalid URL format: ${url ? url.substring(0, 30) + '...' : 'undefined'}`);
    return false;
  }
}
