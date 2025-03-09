
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
  photoUrl: string | null = null,
  inlineKeyboard: any = null
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
      - photoUrl: ${photoUrl ? (photoUrl.length > 30 ? photoUrl.substring(0, 30) + '...' : photoUrl) : 'Not provided'}
      - inlineKeyboard: ${inlineKeyboard ? 'Provided' : 'Not provided'}
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

    // Add inline keyboard if provided
    if (inlineKeyboard) {
      payload.reply_markup = inlineKeyboard;
      console.log("Adding inline keyboard to text message:", JSON.stringify(inlineKeyboard));
    } else {
      console.log("No inline keyboard provided for text message");
    }

    console.log("Text message payload:", JSON.stringify(payload));

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
        
        // Add inline keyboard if provided
        if (inlineKeyboard) {
          formData.append('reply_markup', JSON.stringify(inlineKeyboard));
          console.log("Adding inline keyboard to photo message:", JSON.stringify(inlineKeyboard));
        } else {
          console.log("No inline keyboard provided for photo message");
        }
        
        // Send the request with FormData
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
          return false;
        }

        const result = await response.json();
        
        if (!result.ok) {
          console.error("Error sending photo message with FormData:", result);
          return false;
        }
        
        console.log("Photo message sent successfully with FormData");
        return true;
      } catch (error) {
        console.error("Error processing base64 image:", error);
        
        // Fallback to sending text-only message if image processing fails
        console.log("Falling back to text-only message");
        return await sendTextMessage(botToken, chatId, caption || "Image could not be sent", inlineKeyboard);
      }
    } else {
      // For regular URLs, use the JSON approach
      const payload: any = {
        chat_id: chatId,
        photo: photoUrl,
        parse_mode: "HTML"
      };
      
      if (caption) {
        payload.caption = caption;
      }
      
      // Add inline keyboard if provided
      if (inlineKeyboard) {
        payload.reply_markup = inlineKeyboard;
        console.log("Adding inline keyboard to photo message:", JSON.stringify(inlineKeyboard));
      } else {
        console.log("No inline keyboard provided for photo message");
      }
      
      console.log("Photo message payload:", JSON.stringify(payload));
      
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
        
        // Fallback to sending text-only message if image sending fails
        console.log("Falling back to text-only message");
        return await sendTextMessage(botToken, chatId, caption || "Image could not be sent", inlineKeyboard);
      }
      
      const result = await response.json();
      
      if (!result.ok) {
        console.error("Error sending photo message:", result);
        
        // Fallback to sending text-only message if the API returned an error
        console.log("Falling back to text-only message after API error");
        return await sendTextMessage(botToken, chatId, caption || "Image could not be sent", inlineKeyboard);
      }
      
      console.log("Photo message sent successfully");
      return true;
    }
  } catch (error) {
    console.error("Error sending photo message:", error);
    
    // Final fallback for any unexpected errors
    try {
      console.log("Final fallback to text-only message after exception");
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
