
import { corsHeaders } from "../../cors.ts";

// Implement the sendPhotoMessage function to handle sending images
export async function sendPhotoMessage(
  botToken: string,
  chatId: number | string,
  photoUrl: string,
  caption: string,
  miniAppUrl: string,
  communityId: string
): Promise<boolean> {
  try {
    console.log('[TelegramSender] Sending photo message to:', chatId);
    
    if (!chatId) {
      console.error('[TelegramSender] Missing chat ID');
      return false;
    }

    if (!photoUrl) {
      console.error('[TelegramSender] Missing photo URL');
      return false;
    }

    if (!miniAppUrl) {
      console.warn('[TelegramSender] Missing miniAppUrl, using default');
      miniAppUrl = "https://preview--subscribely-serenity.lovable.app/telegram-mini-app";
    }

    if (!communityId) {
      console.warn('[TelegramSender] Missing communityId, button may not work correctly');
    }

    console.log('[TelegramSender] Photo URL type:', photoUrl.substring(0, 30) + '...');
    
    const inlineKeyboard = {
      inline_keyboard: [
        [
          {
            text: "Join Community 🚀",
            web_app: {
              url: `${miniAppUrl}?start=${communityId || ''}`
            }
          }
        ]
      ]
    };

    console.log('[TelegramSender] Using inline keyboard:', JSON.stringify(inlineKeyboard));

    let response;
    
    // Check if the image is a Base64 data URL
    if (photoUrl.startsWith('data:image')) {
      console.log('[TelegramSender] Detected Base64 image, converting to multipart form...');
      
      try {
        // Extract the Base64 data (remove the data:image/xxx;base64, prefix)
        const base64Data = photoUrl.split(',')[1];
        
        // Determine image format from the data URL
        const matches = photoUrl.match(/^data:image\/([a-zA-Z+]+);base64,/);
        const imageFormat = matches ? matches[1] : 'jpeg'; // Default to jpeg if format can't be determined
        
        // Create a FormData object to send the image as multipart/form-data
        const formData = new FormData();
        formData.append('chat_id', chatId.toString());
        
        // Convert Base64 string to Blob
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
        
        // Append the Blob as a file
        formData.append('photo', blob, `photo.${imageFormat}`);
        
        if (caption) {
          formData.append('caption', caption);
          formData.append('parse_mode', 'HTML');
        }
        
        formData.append('reply_markup', JSON.stringify(inlineKeyboard));
        
        // Send the request with FormData
        response = await fetch(
          `https://api.telegram.org/bot${botToken}/sendPhoto`,
          {
            method: 'POST',
            body: formData
          }
        );
      } catch (error) {
        console.error('[TelegramSender] Error processing base64 image:', error);
        
        // Fall back to text-only message
        console.log('[TelegramSender] Falling back to text-only message');
        return await sendTextMessage(botToken, chatId, caption || 'Image could not be sent', miniAppUrl, communityId);
      }
    } else {
      // For regular URLs, use the JSON approach
      console.log('[TelegramSender] Using regular URL approach');
      
      response = await fetch(
        `https://api.telegram.org/bot${botToken}/sendPhoto`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders
          },
          body: JSON.stringify({
            chat_id: chatId,
            photo: photoUrl,
            caption: caption,
            parse_mode: 'HTML',
            reply_markup: inlineKeyboard
          }),
        }
      );
    }

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[TelegramSender] HTTP error ${response.status}: ${errorText}`);
      
      // Fall back to text-only message
      console.log('[TelegramSender] Falling back to text-only message after HTTP error');
      return await sendTextMessage(botToken, chatId, caption || 'Image could not be sent', miniAppUrl, communityId);
    }

    const data = await response.json();
    
    if (!data.ok) {
      console.error('[TelegramSender] Error sending photo message:', data);
      
      // Fall back to text-only message
      console.log('[TelegramSender] Falling back to text-only message after API error');
      return await sendTextMessage(botToken, chatId, caption || 'Image could not be sent', miniAppUrl, communityId);
    }
    
    console.log('[TelegramSender] Photo message sent successfully');
    return true;
  } catch (error) {
    console.error('[TelegramSender] Error sending photo message:', error);
    
    // Final fallback
    try {
      console.log('[TelegramSender] Final fallback to text-only message');
      return await sendTextMessage(botToken, chatId, caption || 'Image could not be sent', miniAppUrl, communityId);
    } catch (finalError) {
      console.error('[TelegramSender] Even fallback message failed:', finalError);
      return false;
    }
  }
}

// Implement the sendTextMessage function to handle sending text-only messages
export async function sendTextMessage(
  botToken: string,
  chatId: number | string,
  text: string,
  miniAppUrl: string,
  communityId: string
): Promise<boolean> {
  try {
    console.log('[TelegramSender] Sending text message to:', chatId);
    
    if (!chatId) {
      console.error('[TelegramSender] Missing chat ID');
      return false;
    }

    if (!text) {
      console.error('[TelegramSender] Missing text content');
      return false;
    }

    if (!miniAppUrl) {
      console.warn('[TelegramSender] Missing miniAppUrl, using default');
      miniAppUrl = "https://preview--subscribely-serenity.lovable.app/telegram-mini-app";
    }

    if (!communityId) {
      console.warn('[TelegramSender] Missing communityId, button may not work correctly');
    }
    
    const inlineKeyboard = {
      inline_keyboard: [
        [
          {
            text: "Join Community 🚀",
            web_app: {
              url: `${miniAppUrl}?start=${communityId || ''}`
            }
          }
        ]
      ]
    };

    console.log('[TelegramSender] Using inline keyboard:', JSON.stringify(inlineKeyboard));

    const response = await fetch(
      `https://api.telegram.org/bot${botToken}/sendMessage`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders
        },
        body: JSON.stringify({
          chat_id: chatId,
          text: text,
          parse_mode: 'HTML',
          reply_markup: inlineKeyboard
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[TelegramSender] HTTP error ${response.status}: ${errorText}`);
      return false;
    }

    const data = await response.json();
    
    if (!data.ok) {
      console.error('[TelegramSender] Error sending text message:', data);
      return false;
    }
    
    console.log('[TelegramSender] Text message sent successfully');
    return true;
  } catch (error) {
    console.error('[TelegramSender] Error sending text message:', error);
    return false;
  }
}

// Function to verify the bot token is valid
export async function verifyBotToken(botToken: string): Promise<boolean> {
  try {
    console.log('[TelegramSender] Verifying bot token');
    
    const response = await fetch(
      `https://api.telegram.org/bot${botToken}/getMe`,
      {
        headers: corsHeaders
      }
    );
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[TelegramSender] HTTP error ${response.status}: ${errorText}`);
      return false;
    }
    
    const data = await response.json();
    
    if (!data.ok) {
      console.error('[TelegramSender] Invalid bot token:', data);
      return false;
    }
    
    console.log('[TelegramSender] Bot token verified:', data.result.username);
    return true;
  } catch (error) {
    console.error('[TelegramSender] Error verifying bot token:', error);
    return false;
  }
}
