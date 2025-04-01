
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
    // First validate the photo source
    if (!photoUrl) {
      console.log(`[TELEGRAM-PHOTO] No photo source provided, falling back to text message`);
      return await sendTextFallback(botToken, chatId, caption, replyMarkup);
    }
    
    console.log(`[TELEGRAM-PHOTO] Sending photo to ${chatId}`);
    
    // For logging, truncate the URL to avoid huge logs
    const loggablePhotoUrl = typeof photoUrl === 'string' 
      ? (photoUrl.startsWith('data:') 
          ? photoUrl.substring(0, 30) + '...[base64 data]' 
          : photoUrl) 
      : 'null';
    console.log(`[TELEGRAM-PHOTO] Photo source type: ${photoUrl.startsWith('data:') ? 'Data URL' : 'URL/File ID'}`);
    console.log(`[TELEGRAM-PHOTO] Photo source: ${loggablePhotoUrl}`);
    
    // Handle data URLs (base64 encoded images)
    if (photoUrl.startsWith('data:image/')) {
      return await sendBase64Image(botToken, chatId, photoUrl, caption, replyMarkup);
    } 
    
    // Handle regular URLs or file IDs
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
 * Send a base64-encoded image using multipart/form-data
 */
async function sendBase64Image(
  botToken: string,
  chatId: string | number,
  base64Data: string,
  caption: string | null = null,
  replyMarkup: any = null
): Promise<{ ok: boolean; description?: string; result?: any }> {
  try {
    console.log('[TELEGRAM-PHOTO] Processing base64 image data');
    
    // Extract the content type and actual base64 data
    const matches = base64Data.match(/^data:(image\/[a-zA-Z+]+);base64,(.+)$/);
    
    if (!matches || matches.length !== 3) {
      console.error('[TELEGRAM-PHOTO] Invalid base64 data format');
      return await sendTextFallback(botToken, chatId, caption, replyMarkup);
    }
    
    const contentType = matches[1];
    let imageData = matches[2];
    
    // Ensure proper base64 padding
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
    
    if (replyMarkup) {
      const replyMarkupStr = typeof replyMarkup === 'string' 
        ? replyMarkup 
        : JSON.stringify(replyMarkup);
      formData.append('reply_markup', replyMarkupStr);
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
    
    console.log(`[TELEGRAM-PHOTO] Sending multipart form with ${contentType} image`);
    
    // Send the multipart request
    const response = await fetch(`https://api.telegram.org/bot${botToken}/sendPhoto`, {
      method: 'POST',
      body: formData
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      console.error(`[TELEGRAM-PHOTO] ❌ Failed to send base64 image: ${data.description}`);
      
      // For debugging, check the specific error
      if (data.description && data.description.includes('wrong padding')) {
        console.error('[TELEGRAM-PHOTO] Base64 padding error detected');
      }
      
      // Try another approach with smaller/compressed image
      if (contentType === 'image/jpeg' || contentType === 'image/png') {
        try {
          console.log('[TELEGRAM-PHOTO] Attempting to resize and optimize the image');
          const compressedImageUrl = await compressImage(base64Data);
          
          if (compressedImageUrl && compressedImageUrl !== base64Data) {
            return await sendBase64Image(botToken, chatId, compressedImageUrl, caption, replyMarkup);
          }
        } catch (compressionError) {
          console.error('[TELEGRAM-PHOTO] Error compressing image:', compressionError);
        }
      }
      
      // Fall back to text if all image attempts fail
      return await sendTextFallback(botToken, chatId, caption, replyMarkup);
    }
    
    console.log(`[TELEGRAM-PHOTO] ✅ Base64 image sent successfully`);
    return { ok: true, result: data.result };
  } catch (error) {
    console.error(`[TELEGRAM-PHOTO] ❌ Error sending base64 image:`, error);
    return await sendTextFallback(botToken, chatId, caption, replyMarkup);
  }
}

/**
 * Compress and optimize an image
 * This is a mock implementation as full implementation would require canvas or image manipulation libraries
 */
async function compressImage(base64Data: string): Promise<string | null> {
  // This is a simplified version - in a full implementation, 
  // you would use canvas to resize and compress the image
  return base64Data;
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
