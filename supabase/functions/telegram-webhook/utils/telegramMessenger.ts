/**
 * Send a message to a Telegram user with optional image and inline keyboard
 * @param botToken The bot token to use
 * @param chatId The chat/user ID to send to
 * @param text The text message to send
 * @param inlineKeyboard Optional inline keyboard markup
 * @param image Optional image URL or base64 data URL
 * @returns Response object with ok and description properties
 */
export async function sendTelegramMessage(
  botToken: string,
  chatId: string | number,
  text: string,
  inlineKeyboard: any = null,
  image: string | null = null
): Promise<{ ok: boolean, description?: string }> {
  try {
    console.log(`[TELEGRAM-MESSENGER] Sending message to ${chatId}`);
    console.log(`[TELEGRAM-MESSENGER] Message: ${text ? text.substring(0, 50) + '...' : 'No text'}`);
    console.log(`[TELEGRAM-MESSENGER] Has image: ${!!image}`);
    console.log(`[TELEGRAM-MESSENGER] Has inline keyboard: ${!!inlineKeyboard}`);
    
    if (image) {
      // If we have an image, send as photo with caption
      return await sendPhotoWithCaption(botToken, chatId, image, text, inlineKeyboard);
    } else {
      // Otherwise send as text message
      return await sendTextMessage(botToken, chatId, text, inlineKeyboard);
    }
  } catch (error) {
    console.error(`[TELEGRAM-MESSENGER] Error sending message:`, error);
    return { ok: false, description: error.message || 'Unknown error' };
  }
}

/**
 * Send a text message to a Telegram user with optional inline keyboard
 */
async function sendTextMessage(
  botToken: string,
  chatId: string | number,
  text: string,
  inlineKeyboard: any = null
): Promise<{ ok: boolean, description?: string }> {
  try {
    console.log(`[TELEGRAM-MESSENGER] Sending text message to ${chatId}`);
    
    // Create the request payload
    const payload: any = {
      chat_id: chatId,
      text: text || "📢 Message from community owner",
      parse_mode: "HTML"
    };

    // Add reply markup if provided
    if (inlineKeyboard) {
      if (typeof inlineKeyboard === 'string') {
        try {
          // If it's a string, parse it to ensure it's valid JSON
          payload.reply_markup = JSON.parse(inlineKeyboard);
          console.log(`[TELEGRAM-MESSENGER] Using parsed inline keyboard`);
        } catch (e) {
          console.error(`[TELEGRAM-MESSENGER] Failed to parse inline keyboard:`, e);
          // If parsing fails, don't add the keyboard
        }
      } else {
        // If it's already an object, use it directly
        payload.reply_markup = inlineKeyboard;
        console.log(`[TELEGRAM-MESSENGER] Using object inline keyboard`);
      }
      
      console.log(`[TELEGRAM-MESSENGER] Inline keyboard:`, JSON.stringify(payload.reply_markup));
    }

    // Make the API request
    const response = await fetch(
      `https://api.telegram.org/bot${botToken}/sendMessage`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      }
    );

    // Parse the response
    const result = await response.json();
    
    if (!result.ok) {
      console.error(`[TELEGRAM-MESSENGER] ❌ Telegram API error:`, result);
      return { ok: false, description: result.description || 'Unknown Telegram API error' };
    }
    
    console.log(`[TELEGRAM-MESSENGER] ✅ Message sent successfully`);
    return { ok: true };
  } catch (error) {
    console.error(`[TELEGRAM-MESSENGER] ❌ Error sending text message:`, error);
    return { ok: false, description: error.message || 'Unknown error sending text message' };
  }
}

/**
 * Send an image with caption to a Telegram user
 */
async function sendPhotoWithCaption(
  botToken: string,
  chatId: string | number,
  imageData: string,
  caption: string = "",
  inlineKeyboard: any = null
): Promise<{ ok: boolean, description?: string }> {
  try {
    console.log(`[TELEGRAM-MESSENGER] Sending photo message to ${chatId}`);
    
    // Handle base64 image data
    if (imageData.startsWith('data:image')) {
      console.log(`[TELEGRAM-MESSENGER] Processing base64 image data`);
      
      try {
        // Create a FormData object for multipart/form-data request
        const formData = new FormData();
        formData.append('chat_id', chatId.toString());
        
        // Extract the base64 data (remove the data:image/xxx;base64, prefix)
        const base64Data = imageData.split(',')[1];
        const matches = imageData.match(/^data:image\/([a-zA-Z+]+);base64,/);
        const imageFormat = matches ? matches[1] : 'jpeg'; // Default to jpeg if format can't be determined
        
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
        
        // Append the photo as a file
        formData.append('photo', blob, `photo.${imageFormat}`);
        
        // Add caption if provided
        if (caption) {
          formData.append('caption', caption);
          formData.append('parse_mode', 'HTML');
        }
        
        // Add reply markup if provided
        if (inlineKeyboard) {
          if (typeof inlineKeyboard === 'string') {
            formData.append('reply_markup', inlineKeyboard);
          } else {
            formData.append('reply_markup', JSON.stringify(inlineKeyboard));
          }
          console.log(`[TELEGRAM-MESSENGER] Added inline keyboard to photo message`);
        }
        
        // Send the multipart request
        const response = await fetch(
          `https://api.telegram.org/bot${botToken}/sendPhoto`,
          {
            method: 'POST',
            body: formData
          }
        );
        
        const result = await response.json();
        
        if (!result.ok) {
          console.error(`[TELEGRAM-MESSENGER] ❌ Telegram API error:`, result);
          // Fallback to sending text-only message if photo sending fails
          console.log(`[TELEGRAM-MESSENGER] Falling back to text-only message`);
          return await sendTextMessage(botToken, chatId, `${caption}\n\n(Image could not be sent)`, inlineKeyboard);
        }
        
        console.log(`[TELEGRAM-MESSENGER] ✅ Photo message sent successfully`);
        return { ok: true };
      } catch (error) {
        console.error(`[TELEGRAM-MESSENGER] ❌ Error processing base64 image:`, error);
        // Fallback to text-only if image processing fails
        return await sendTextMessage(botToken, chatId, caption, inlineKeyboard);
      }
    } 
    // Handle URL images
    else if (imageData.startsWith('http')) {
      console.log(`[TELEGRAM-MESSENGER] Using image URL: ${imageData.substring(0, 50)}...`);
      
      // Create the request payload
      const payload: any = {
        chat_id: chatId,
        photo: imageData,
      };
      
      // Add caption if provided
      if (caption) {
        payload.caption = caption;
        payload.parse_mode = 'HTML';
      }
      
      // Add reply markup if provided
      if (inlineKeyboard) {
        if (typeof inlineKeyboard === 'string') {
          try {
            payload.reply_markup = JSON.parse(inlineKeyboard);
          } catch (e) {
            payload.reply_markup = inlineKeyboard;
          }
        } else {
          payload.reply_markup = inlineKeyboard;
        }
        console.log(`[TELEGRAM-MESSENGER] Added inline keyboard to URL photo message`);
      }
      
      // Make the API request
      const response = await fetch(
        `https://api.telegram.org/bot${botToken}/sendPhoto`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(payload)
        }
      );
      
      const result = await response.json();
      
      if (!result.ok) {
        console.error(`[TELEGRAM-MESSENGER] ❌ Telegram API error:`, result);
        // Fallback to text-only message if photo sending fails
        return await sendTextMessage(botToken, chatId, `${caption}\n\n(Image could not be sent)`, inlineKeyboard);
      }
      
      console.log(`[TELEGRAM-MESSENGER] ✅ Photo message with URL sent successfully`);
      return { ok: true };
    } 
    // Invalid image data format
    else {
      console.error(`[TELEGRAM-MESSENGER] ❌ Invalid image data format`);
      // Just send the text message without image
      return await sendTextMessage(botToken, chatId, caption, inlineKeyboard);
    }
  } catch (error) {
    console.error(`[TELEGRAM-MESSENGER] ❌ Error in sendPhotoWithCaption:`, error);
    // Fallback to text-only message in case of any error
    try {
      return await sendTextMessage(botToken, chatId, caption, inlineKeyboard);
    } catch (finalError) {
      console.error(`[TELEGRAM-MESSENGER] ❌ Final error in fallback:`, finalError);
      return { ok: false, description: finalError.message || 'Failed to send both photo and text' };
    }
  }
}
