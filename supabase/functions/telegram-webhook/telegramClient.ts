
import { corsHeaders } from "./cors.ts";

/**
 * Send a text message to a Telegram chat
 */
export async function sendTelegramMessage(
  botToken: string,
  chatId: string | number,
  text: string,
  replyMarkup: any = null
): Promise<any> {
  console.log(`[Telegram Client] Sending message to chat ${chatId}`);
  
  const url = `https://api.telegram.org/bot${botToken}/sendMessage`;
  
  const body: any = {
    chat_id: chatId,
    text: text,
    parse_mode: "HTML"
  };
  
  if (replyMarkup) {
    // Ensure reply markup is properly formatted
    body.reply_markup = typeof replyMarkup === 'string' 
      ? replyMarkup 
      : JSON.stringify(replyMarkup);
    console.log(`[Telegram Client] Including reply markup:`, typeof replyMarkup === 'string' ? replyMarkup : JSON.stringify(replyMarkup));
  }

  try {
    console.log(`[Telegram Client] Making API request to: ${url}`);
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders
      },
      body: JSON.stringify(body)
    });
    
    const responseData = await response.json();
    
    if (!responseData.ok) {
      console.error(`[Telegram Client] API Error: ${responseData.description}`);
      console.error(`[Telegram Client] Request body was:`, JSON.stringify(body));
      throw new Error(responseData.description);
    }
    
    console.log(`[Telegram Client] Message sent successfully to ${chatId}`);
    return responseData;
  } catch (error) {
    console.error(`[Telegram Client] Error sending message:`, error);
    throw error;
  }
}

/**
 * Send a photo message to a Telegram chat
 */
export async function sendTelegramPhotoMessage(
  botToken: string,
  chatId: string | number,
  photo: string,
  caption: string = "",
  replyMarkup: any = null
): Promise<any> {
  console.log(`[Telegram Client] Sending photo to chat ${chatId}`);
  
  // Validate photo URL
  if (!photo.startsWith('https://') && !photo.startsWith('data:image/')) {
    console.error(`[Telegram Client] Invalid photo URL: ${photo.substring(0, 30)}...`);
    throw new Error("Invalid photo URL format. Must be HTTPS URL or base64 data URL.");
  }
  
  const url = `https://api.telegram.org/bot${botToken}/sendPhoto`;
  
  const body: any = {
    chat_id: chatId,
    photo: photo,
    parse_mode: "HTML"
  };
  
  if (caption) {
    body.caption = caption;
  }
  
  if (replyMarkup) {
    // Ensure reply markup is properly formatted
    body.reply_markup = typeof replyMarkup === 'string' 
      ? replyMarkup 
      : JSON.stringify(replyMarkup);
    console.log(`[Telegram Client] Including reply markup:`, typeof replyMarkup === 'string' ? replyMarkup : JSON.stringify(replyMarkup));
  }

  try {
    console.log(`[Telegram Client] Making API request to: ${url}`);
    
    // Check if the photo is a base64 data URL
    if (photo.startsWith('data:image')) {
      console.log(`[Telegram Client] Base64 image detected, using multipart/form-data`);
      
      // Extract the base64 data
      const base64Data = photo.split(',')[1];
      
      // Get image format from data URL
      const matches = photo.match(/^data:image\/([a-zA-Z+]+);base64,/);
      const imageFormat = matches ? matches[1] : 'jpeg';
      
      // Create a FormData object
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
      
      // Add the photo to the form data
      formData.append('photo', blob, `photo.${imageFormat}`);
      
      // Add other parameters
      if (caption) {
        formData.append('caption', caption);
        formData.append('parse_mode', 'HTML');
      }
      
      if (replyMarkup) {
        formData.append('reply_markup', typeof replyMarkup === 'string' ? replyMarkup : JSON.stringify(replyMarkup));
      }
      
      // Make the request
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          ...corsHeaders
        },
        body: formData
      });
      
      const responseData = await response.json();
      
      if (!responseData.ok) {
        console.error(`[Telegram Client] API Error: ${responseData.description}`);
        // Try to fall back to text-only message
        console.log(`[Telegram Client] Falling back to text-only message`);
        return await sendTelegramMessage(botToken, chatId, caption || "Image could not be sent", replyMarkup);
      }
      
      console.log(`[Telegram Client] Photo sent successfully to ${chatId}`);
      return responseData;
    } else {
      // Regular URL approach
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders
        },
        body: JSON.stringify(body)
      });
      
      const responseData = await response.json();
      
      if (!responseData.ok) {
        console.error(`[Telegram Client] API Error: ${responseData.description}`);
        console.error(`[Telegram Client] Request body was:`, JSON.stringify(body));
        
        // Try to fall back to text-only message
        console.log(`[Telegram Client] Falling back to text-only message`);
        return await sendTelegramMessage(botToken, chatId, caption || "Image could not be sent", replyMarkup);
      }
      
      console.log(`[Telegram Client] Photo sent successfully to ${chatId}`);
      return responseData;
    }
  } catch (error) {
    console.error(`[Telegram Client] Error sending photo:`, error);
    
    // Attempt to fall back to text-only message
    try {
      console.log(`[Telegram Client] Falling back to text-only message after exception`);
      return await sendTelegramMessage(botToken, chatId, caption || "Image could not be sent", replyMarkup);
    } catch (fallbackError) {
      console.error(`[Telegram Client] Even fallback message failed:`, fallbackError);
      throw error;
    }
  }
}

/**
 * Verify if a user can receive messages from the bot
 * @returns true if the bot can message the user, false otherwise
 */
export async function canMessageUser(
  botToken: string,
  userId: string | number
): Promise<boolean> {
  try {
    console.log(`[Telegram Client] Checking if bot can message user ${userId}`);
    
    const url = `https://api.telegram.org/bot${botToken}/getChat`;
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders
      },
      body: JSON.stringify({
        chat_id: userId
      })
    });
    
    const data = await response.json();
    
    if (data.ok) {
      console.log(`[Telegram Client] Bot can message user ${userId}`);
      return true;
    } else {
      console.log(`[Telegram Client] Bot cannot message user ${userId}: ${data.description}`);
      return false;
    }
  } catch (error) {
    console.error(`[Telegram Client] Error checking if bot can message user:`, error);
    return false;
  }
}

/**
 * Helper function to validate image URLs
 */
function isValidImageUrl(url: string): boolean {
  if (!url) return false;
  
  // Check if it's a base64 data URL for an image
  if (url.startsWith('data:image/')) {
    return true;
  }
  
  // Check if it's a URL
  try {
    new URL(url);
    return url.startsWith('https://');
  } catch (e) {
    return false;
  }
}
