/**
 * Telegram messaging utility for sending messages with or without images
 */

/**
 * Send a text or photo message to a Telegram user
 */
export async function sendTelegramMessage(
  botToken: string,
  chatId: string | number,
  message: string,
  inlineKeyboard: any = null,
  photoUrl: string | null = null
): Promise<boolean> {
  try {
    if (!chatId) {
      console.error("Error in sendTelegramMessage: Missing chat ID");
      return false;
    }

    if (!message && !photoUrl) {
      console.error("Error in sendTelegramMessage: Missing both message and photo");
      return false;
    }

    if (!botToken) {
      console.error("Error in sendTelegramMessage: Missing bot token");
      return false;
    }

    // Debug the parameters
    console.log(`sendTelegramMessage parameters:
      - chatId: ${chatId}
      - message length: ${message ? message.length : 0}
      - inlineKeyboard: ${inlineKeyboard ? 'Provided' : 'Not provided'}
      - photoUrl: ${photoUrl ? (photoUrl.length > 30 ? photoUrl.substring(0, 30) + '...' : photoUrl) : 'Not provided'}
    `);

    // If photo URL is provided, send as photo with caption
    if (photoUrl) {
      console.log(`Sending photo message to ${chatId}`);
      return await sendPhotoMessage(botToken, chatId, photoUrl, message, inlineKeyboard);
    } 
    // Otherwise send as text message
    else {
      console.log(`Sending text message to ${chatId}`);
      return await sendTextMessage(botToken, chatId, message, inlineKeyboard);
    }
  } catch (error) {
    console.error("Error in sendTelegramMessage:", error);
    return false;
  }
}

/**
 * Send a text message to a Telegram user
 */
export async function sendTextMessage(
  botToken: string,
  chatId: string | number,
  message: string,
  inlineKeyboard: any = null
): Promise<boolean> {
  try {
    if (!chatId) {
      console.error("Error in sendTextMessage: Missing chat ID");
      return false;
    }

    console.log(`Sending text message to ${chatId}`);
    
    const payload: any = {
      chat_id: chatId,
      text: message,
      parse_mode: "HTML"
    };

    // Add inline keyboard if provided - ensure we don't double stringify
    if (inlineKeyboard) {
      payload.reply_markup = typeof inlineKeyboard === 'string' 
        ? inlineKeyboard 
        : JSON.stringify(inlineKeyboard);
    }

    const response = await fetch(
      `https://api.telegram.org/bot${botToken}/sendMessage`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`HTTP error ${response.status}: ${errorText}`);
      return false;
    }

    const result = await response.json();
    
    if (!result.ok) {
      console.error("Error sending text message:", result);
      return false;
    }
    
    console.log("Text message sent successfully");
    return true;
  } catch (error) {
    console.error("Error sending text message:", error);
    return false;
  }
}

/**
 * Send a photo message to a Telegram user
 */
export async function sendPhotoMessage(
  botToken: string,
  chatId: string | number,
  photoUrl: string,
  caption: string = "",
  inlineKeyboard: any = null
): Promise<boolean> {
  try {
    if (!chatId) {
      console.error("Error in sendPhotoMessage: Missing chat ID");
      return false;
    }

    if (!photoUrl) {
      console.error("Error in sendPhotoMessage: Missing photo URL");
      return false;
    }

    console.log(`Sending photo message to ${chatId}`);
    
    // Check if the image is a Base64 data URL
    if (photoUrl.startsWith('data:image')) {
      console.log('Base64 image detected, processing as multipart form data');
      
      try {
        // Extract the content type and actual base64 data
        const matches = photoUrl.match(/^data:(image\/[a-zA-Z+]+);base64,(.+)$/);
        
        if (!matches || matches.length !== 3) {
          console.error('Invalid base64 data format');
          return await sendTextMessage(botToken, chatId, caption || "Image could not be sent", inlineKeyboard);
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
        
        if (inlineKeyboard) {
          const replyMarkupStr = typeof inlineKeyboard === 'string' 
            ? inlineKeyboard 
            : JSON.stringify(inlineKeyboard);
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
        
        // Send the multipart request
        const response = await fetch(
          `https://api.telegram.org/bot${botToken}/sendPhoto`,
          {
            method: 'POST',
            body: formData
          }
        );
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error(`HTTP error ${response.status}: ${errorText}`);
          
          // Fallback to sending text-only message
          console.log("Falling back to text-only message");
          return await sendTextMessage(botToken, chatId, caption || "Image could not be sent", inlineKeyboard);
        }
        
        const result = await response.json();
        
        if (!result.ok) {
          console.error("Error sending photo message with FormData:", result);
          
          // Fallback to sending text-only message
          console.log("Falling back to text-only message");
          return await sendTextMessage(botToken, chatId, caption || "Image could not be sent", inlineKeyboard);
        }
        
        console.log("Photo message sent successfully with FormData");
        return true;
      } catch (error) {
        console.error("Error processing base64 image:", error);
        
        // Fallback to sending text-only message
        console.log("Falling back to text-only message");
        return await sendTextMessage(botToken, chatId, caption || "Image could not be sent", inlineKeyboard);
      }
    } else {
      // For regular URLs, use the JSON approach
      const payload: any = {
        chat_id: chatId,
        photo: photoUrl
      };
      
      if (caption) {
        payload.caption = caption;
        payload.parse_mode = "HTML";
      }
      
      // Add inline keyboard if provided - ensure we don't double stringify
      if (inlineKeyboard) {
        payload.reply_markup = typeof inlineKeyboard === 'string' 
          ? inlineKeyboard 
          : JSON.stringify(inlineKeyboard);
      }
      
      const response = await fetch(
        `https://api.telegram.org/bot${botToken}/sendPhoto`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`HTTP error ${response.status}: ${errorText}`);
        
        // Fallback to sending text-only message
        console.log("Falling back to text-only message");
        return await sendTextMessage(botToken, chatId, caption || "Image could not be sent", inlineKeyboard);
      }
      
      const result = await response.json();
      
      if (!result.ok) {
        console.error("Error sending photo message:", result);
        
        // Fallback to sending text-only message
        console.log("Falling back to text-only message");
        return await sendTextMessage(botToken, chatId, caption || "Image could not be sent", inlineKeyboard);
      }
      
      console.log("Photo message sent successfully");
      return true;
    }
  } catch (error) {
    console.error("Error sending photo message:", error);
    
    // Final fallback for any unexpected errors
    try {
      console.log("Final fallback to text-only message");
      return await sendTextMessage(botToken, chatId, caption || "Image could not be sent", inlineKeyboard);
    } catch (finalError) {
      console.error("Even fallback message failed:", finalError);
      return false;
    }
  }
}

// Export the TelegramMessenger object for backward compatibility
export const TelegramMessenger = {
  sendTextMessage,
  sendPhotoMessage,
  sendTelegramMessage
};
