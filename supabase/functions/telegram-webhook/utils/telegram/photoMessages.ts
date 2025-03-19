
import { getApiHeaders, isValidImageUrl, processBase64Image, formatReplyMarkup } from "./coreClient.ts";
import { sendTelegramMessage } from "./textMessages.ts";

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
  if (!isValidImageUrl(photo)) {
    console.error(`[Telegram Client] Invalid photo URL: ${photo.substring(0, 30)}...`);
    throw new Error("Invalid photo URL format. Must be HTTPS URL or base64 data URL.");
  }
  
  const url = `https://api.telegram.org/bot${botToken}/sendPhoto`;
  
  // Check if the photo is a base64 data URL
  if (photo.startsWith('data:image')) {
    console.log(`[Telegram Client] Base64 image detected, using multipart/form-data`);
    
    try {
      // Extract the base64 data
      const base64Data = photo.split(',')[1];
      
      // Get image format from data URL
      const matches = photo.match(/^data:image\/([a-zA-Z+]+);base64,/);
      const imageFormat = matches ? matches[1] : 'jpeg';
      
      // Create a FormData object
      const formData = new FormData();
      formData.append('chat_id', chatId.toString());
      
      // Convert base64 to Blob
      const blob = processBase64Image(base64Data, imageFormat);
      
      // Add the photo to the form data
      formData.append('photo', blob, `photo.${imageFormat}`);
      
      // Add other parameters
      if (caption) {
        formData.append('caption', caption);
        formData.append('parse_mode', 'HTML');
      }
      
      if (replyMarkup) {
        formData.append('reply_markup', formatReplyMarkup(replyMarkup) || "");
      }
      
      // Make the request
      return await sendPhotoFormData(botToken, url, formData, chatId, caption, replyMarkup);
    } catch (error) {
      return handlePhotoError(botToken, chatId, caption, replyMarkup, error);
    }
  } else {
    // Regular URL approach
    return await sendPhotoUrl(botToken, url, chatId, photo, caption, replyMarkup);
  }
}

/**
 * Send photo using FormData (for base64 images)
 */
async function sendPhotoFormData(
  botToken: string,
  url: string,
  formData: FormData,
  chatId: string | number,
  caption: string = "",
  replyMarkup: any = null
): Promise<any> {
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: getApiHeaders(true),
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
  } catch (error) {
    return handlePhotoError(botToken, chatId, caption, replyMarkup, error);
  }
}

/**
 * Send photo using direct URL
 */
async function sendPhotoUrl(
  botToken: string,
  url: string,
  chatId: string | number,
  photo: string,
  caption: string = "",
  replyMarkup: any = null
): Promise<any> {
  try {
    const body: any = {
      chat_id: chatId,
      photo: photo,
      parse_mode: "HTML"
    };
    
    if (caption) {
      body.caption = caption;
    }
    
    if (replyMarkup) {
      body.reply_markup = formatReplyMarkup(replyMarkup);
      console.log(`[Telegram Client] Including reply markup:`, typeof replyMarkup === 'string' ? replyMarkup : JSON.stringify(replyMarkup));
    }
    
    console.log(`[Telegram Client] Making API request to: ${url}`);
    
    const response = await fetch(url, {
      method: "POST",
      headers: getApiHeaders(),
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
  } catch (error) {
    return handlePhotoError(botToken, chatId, caption, replyMarkup, error);
  }
}

/**
 * Handle errors in photo sending by falling back to text message
 */
async function handlePhotoError(
  botToken: string,
  chatId: string | number,
  caption: string = "",
  replyMarkup: any = null,
  error: any
): Promise<any> {
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
