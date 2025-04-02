
/**
 * Utilities for sending photo messages via Telegram Bot API
 */

/**
 * Validate if the provided source is a valid photo URL or base64 image data
 */
export function isValidPhotoSource(source: string | null): boolean {
  if (!source) return false;
  
  // Check if it's a URL
  if (source.startsWith('http://') || source.startsWith('https://')) {
    return true;
  }
  
  // Check if it's a valid base64 data URL for images
  if (source.startsWith('data:image/')) {
    return true;
  }
  
  return false;
}

/**
 * Send a photo with caption to a Telegram user
 */
export async function sendPhotoWithCaption(
  botToken: string,
  chatId: string | number,
  photoUrl: string | null,
  caption: string = '',
  inlineKeyboard: any = null
): Promise<{ ok: boolean, description?: string }> {
  try {
    if (!photoUrl) {
      console.error(`[TELEGRAM-MESSENGER] No photo URL provided for sendPhotoWithCaption`);
      return { ok: false, description: 'No photo URL provided' };
    }
    
    console.log(`[TELEGRAM-MESSENGER] Sending photo to ${chatId}`);
    console.log(`[TELEGRAM-MESSENGER] Caption: ${caption ? caption.substring(0, 50) + '...' : 'No caption'}`);
    console.log(`[TELEGRAM-MESSENGER] Has inline keyboard: ${!!inlineKeyboard}`);
    
    // Create the request payload
    const payload: any = {
      chat_id: chatId,
      caption: caption || '',
      parse_mode: "HTML"
    };
    
    // Handle base64 data URLs differently than regular URLs
    let requestOptions: RequestInit;
    let endpoint: string;
    
    if (photoUrl.startsWith('data:image')) {
      console.log(`[TELEGRAM-MESSENGER] Processing base64 image`);
      
      // Extract content type and data
      const matches = photoUrl.match(/^data:(image\/[a-zA-Z+]+);base64,(.+)$/);
      
      if (!matches || matches.length !== 3) {
        console.error(`[TELEGRAM-MESSENGER] Invalid base64 image format`);
        return { ok: false, description: 'Invalid base64 image format' };
      }
      
      const contentType = matches[1];
      let imageData = matches[2];
      
      // Ensure padding is correct
      const paddingNeeded = (4 - (imageData.length % 4)) % 4;
      if (paddingNeeded > 0) {
        imageData += '='.repeat(paddingNeeded);
      }
      
      // Create FormData for multipart request
      const formData = new FormData();
      formData.append('chat_id', chatId.toString());
      
      if (caption) {
        formData.append('caption', caption);
        formData.append('parse_mode', 'HTML');
      }
      
      // Add reply markup if present
      if (inlineKeyboard) {
        formData.append('reply_markup', 
          typeof inlineKeyboard === 'string' 
            ? inlineKeyboard 
            : JSON.stringify(inlineKeyboard));
      }
      
      // Convert base64 to binary
      const binaryStr = atob(imageData);
      const bytes = new Uint8Array(binaryStr.length);
      for (let i = 0; i < binaryStr.length; i++) {
        bytes[i] = binaryStr.charCodeAt(i);
      }
      
      // Extract file extension
      const extension = contentType.split('/')[1] || 'jpg';
      
      // Create blob and append it
      const blob = new Blob([bytes], { type: contentType });
      formData.append('photo', blob, `photo.${extension}`);
      
      // Set up multipart request
      endpoint = `https://api.telegram.org/bot${botToken}/sendPhoto`;
      requestOptions = {
        method: 'POST',
        body: formData
      };
    } else {
      // For regular URLs
      endpoint = `https://api.telegram.org/bot${botToken}/sendPhoto`;
      
      payload.photo = photoUrl;
      
      // Add reply markup if present
      if (inlineKeyboard) {
        payload.reply_markup = typeof inlineKeyboard === 'string' 
          ? inlineKeyboard 
          : JSON.stringify(inlineKeyboard);
      }
      
      requestOptions = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      };
    }
    
    // Make the API request
    const response = await fetch(endpoint, requestOptions);
    
    // Parse the response
    const result = await response.json();
    
    if (!result.ok) {
      console.error(`[TELEGRAM-MESSENGER] ❌ Telegram API error when sending photo:`, result);
      return { ok: false, description: result.description || 'Unknown Telegram API error' };
    }
    
    console.log(`[TELEGRAM-MESSENGER] ✅ Photo sent successfully`);
    return { ok: true };
  } catch (error) {
    console.error(`[TELEGRAM-MESSENGER] ❌ Error sending photo message:`, error);
    return { ok: false, description: error.message || 'Unknown error sending photo' };
  }
}
