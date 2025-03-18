
/**
 * Utility for sending messages via Telegram Bot API
 */

// Define the response type
interface TelegramResponse {
  ok: boolean;
  description?: string;
  result?: any;
}

/**
 * Send a message to Telegram user
 * Handles both text messages and image messages with captions
 */
export async function sendTelegramMessage(
  botToken: string,
  chatId: string | number,
  text: string,
  replyMarkup?: any,
  imageUrl?: string | null
): Promise<TelegramResponse> {
  try {
    console.log(`[TELEGRAM-MESSENGER] 📩 Sending message to chat ${chatId}${imageUrl ? ' with image' : ''}`);
    
    // Validate required parameters
    if (!botToken) {
      console.error(`[TELEGRAM-MESSENGER] ❌ Missing bot token`);
      return { ok: false, description: "Bot token is required" };
    }
    
    if (!chatId) {
      console.error(`[TELEGRAM-MESSENGER] ❌ Missing chat ID`);
      return { ok: false, description: "Chat ID is required" };
    }
    
    if (!text || text.trim() === '') {
      console.error(`[TELEGRAM-MESSENGER] ❌ Missing message text`);
      return { ok: false, description: "Message text is required" };
    }
    
    // Choose the API endpoint based on whether we're sending an image or just text
    const endpoint = imageUrl 
      ? 'sendPhoto'  // For messages with images
      : 'sendMessage'; // For text-only messages
    
    // Prepare the API URL
    const apiUrl = `https://api.telegram.org/bot${botToken}/${endpoint}`;
    
    // Prepare the payload based on message type
    const payload: any = {
      chat_id: chatId,
      parse_mode: 'HTML'
    };
    
    // Add reply markup if provided
    if (replyMarkup) {
      payload.reply_markup = typeof replyMarkup === 'string' 
        ? replyMarkup 
        : JSON.stringify(replyMarkup);
    }
    
    // Handle image data URLs by converting to multipart/form-data
    if (imageUrl && imageUrl.startsWith('data:image/')) {
      console.log(`[TELEGRAM-MESSENGER] 🖼️ Sending image as multipart/form-data`);
      
      try {
        // Extract the base64 data and image format
        const matches = imageUrl.match(/^data:image\/([a-zA-Z+]+);base64,(.+)$/);
        
        if (!matches || matches.length !== 3) {
          console.error(`[TELEGRAM-MESSENGER] ❌ Invalid image data URL format`);
          // Fall back to text-only message
          return await sendTextOnlyMessage(botToken, chatId, text, replyMarkup);
        }
        
        const imageFormat = matches[1];
        const base64Data = matches[2];
        
        // Create FormData object
        const formData = new FormData();
        formData.append('chat_id', chatId.toString());
        
        // Convert base64 to Blob
        const byteCharacters = atob(base64Data);
        const byteArrays = [];
        
        for (let offset = 0; offset < byteCharacters.length; offset += 1024) {
          const slice = byteCharacters.slice(offset, offset + 1024);
          
          const byteNumbers = new Array(slice.length);
          for (let i = 0; i < slice.length; i++) {
            byteNumbers[i] = slice.charCodeAt(i);
          }
          
          const byteArray = new Uint8Array(byteNumbers);
          byteArrays.push(byteArray);
        }
        
        const blob = new Blob(byteArrays, { type: `image/${imageFormat}` });
        
        // Add photo to FormData
        formData.append('photo', blob, `photo.${imageFormat}`);
        
        // Add caption (text) to FormData
        formData.append('caption', text);
        formData.append('parse_mode', 'HTML');
        
        // Add reply markup if provided
        if (replyMarkup) {
          formData.append('reply_markup', typeof replyMarkup === 'string' 
            ? replyMarkup 
            : JSON.stringify(replyMarkup));
        }
        
        // Send the request
        const response = await fetch(apiUrl, {
          method: 'POST',
          body: formData
        });
        
        const data = await response.json();
        
        if (!data.ok) {
          console.error(`[TELEGRAM-MESSENGER] ❌ Error sending image with FormData:`, data);
          // Fall back to text-only message
          return await sendTextOnlyMessage(botToken, chatId, text, replyMarkup);
        }
        
        console.log(`[TELEGRAM-MESSENGER] ✅ Image sent successfully with FormData`);
        return data;
      } catch (error) {
        console.error(`[TELEGRAM-MESSENGER] ❌ Error processing image data:`, error);
        // Fall back to text-only message
        return await sendTextOnlyMessage(botToken, chatId, text, replyMarkup);
      }
    } 
    // Handle regular URL images or text-only messages
    else {
      if (imageUrl) {
        // For URL images
        payload.photo = imageUrl;
        payload.caption = text;
      } else {
        // For text-only messages
        payload.text = text;
      }
      
      console.log(`[TELEGRAM-MESSENGER] 🔄 Calling Telegram API: ${endpoint}`);
      
      // Send the request
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });
      
      // Parse the response
      const data = await response.json();
      
      if (!data.ok) {
        console.error(`[TELEGRAM-MESSENGER] ❌ Telegram API error:`, data);
        
        // If this was an image message and it failed, try falling back to text-only
        if (imageUrl) {
          console.log(`[TELEGRAM-MESSENGER] 🔄 Falling back to text-only message`);
          return await sendTextOnlyMessage(botToken, chatId, text, replyMarkup);
        }
        
        return {
          ok: false,
          description: data.description || "Unknown error from Telegram API"
        };
      }
      
      console.log(`[TELEGRAM-MESSENGER] ✅ Message sent successfully`);
      return {
        ok: true,
        result: data.result
      };
    }
  } catch (error) {
    console.error(`[TELEGRAM-MESSENGER] ❌ Exception:`, error);
    return {
      ok: false,
      description: error instanceof Error ? error.message : "Unknown error"
    };
  }
}

/**
 * Helper function to send a text-only message
 * Used as a fallback when image sending fails
 */
async function sendTextOnlyMessage(
  botToken: string,
  chatId: string | number,
  text: string,
  replyMarkup?: any
): Promise<TelegramResponse> {
  try {
    console.log(`[TELEGRAM-MESSENGER] 📝 Sending text-only fallback message`);
    
    const url = `https://api.telegram.org/bot${botToken}/sendMessage`;
    
    const payload: any = {
      chat_id: chatId,
      text: text,
      parse_mode: 'HTML'
    };
    
    if (replyMarkup) {
      payload.reply_markup = typeof replyMarkup === 'string' 
        ? replyMarkup 
        : JSON.stringify(replyMarkup);
    }
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });
    
    const data = await response.json();
    
    if (!data.ok) {
      console.error(`[TELEGRAM-MESSENGER] ❌ Even fallback text message failed:`, data);
      return {
        ok: false,
        description: data.description || "Failed to send even text-only message"
      };
    }
    
    console.log(`[TELEGRAM-MESSENGER] ✅ Fallback text message sent successfully`);
    return {
      ok: true,
      result: data.result
    };
  } catch (error) {
    console.error(`[TELEGRAM-MESSENGER] ❌ Error sending fallback text message:`, error);
    return {
      ok: false,
      description: error instanceof Error ? error.message : "Unknown error in fallback"
    };
  }
}
