
// Implement the sendPhotoMessage function to handle sending images with proper processing of Base64 data
export async function sendPhotoMessage(
  botToken: string,
  chatId: number | string,
  photoData: string,
  caption: string,
  miniAppUrl: string,
  communityId: string
): Promise<boolean> {
  try {
    console.log('[TelegramSender] Sending photo message to:', chatId);
    
    // Create inline keyboard for the mini app
    const inlineKeyboard = {
      inline_keyboard: [
        [
          {
            text: "Join Community 🚀",
            web_app: {
              url: `${miniAppUrl}?start=${communityId}`
            }
          }
        ]
      ]
    };

    // For Base64 images, we need to convert them to a Buffer
    if (photoData && photoData.startsWith('data:image')) {
      console.log('[TelegramSender] Processing Base64 image');
      
      // Extract the Base64 content without the data URL prefix
      const matches = photoData.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
      
      if (!matches || matches.length !== 3) {
        console.error('[TelegramSender] Invalid Base64 image format, falling back to text message');
        return await sendTextMessage(botToken, chatId, caption, miniAppUrl, communityId);
      }
      
      const base64Data = matches[2];
      
      // Create a binary blob for the multipart request
      const byteCharacters = atob(base64Data);
      const byteArrays = [];
      
      for (let offset = 0; offset < byteCharacters.length; offset += 512) {
        const slice = byteCharacters.slice(offset, offset + 512);
        
        const byteNumbers = new Array(slice.length);
        for (let i = 0; i < slice.length; i++) {
          byteNumbers[i] = slice.charCodeAt(i);
        }
        
        const byteArray = new Uint8Array(byteNumbers);
        byteArrays.push(byteArray);
      }
      
      const blob = new Blob(byteArrays, { type: 'image/jpeg' });
      
      // Create form data for the multipart request
      const formData = new FormData();
      formData.append('chat_id', chatId.toString());
      formData.append('photo', blob, 'welcome_image.jpg');
      formData.append('caption', caption);
      formData.append('parse_mode', 'HTML');
      formData.append('reply_markup', JSON.stringify(inlineKeyboard));
      
      // Send the request
      const response = await fetch(
        `https://api.telegram.org/bot${botToken}/sendPhoto`,
        {
          method: 'POST',
          body: formData
        }
      );
      
      const data = await response.json();
      
      if (!data.ok) {
        console.error('[TelegramSender] Error sending photo message:', data);
        // Try sending as URL instead, sometimes this works better
        return await sendPhotoAsUrlOrFallback(botToken, chatId, photoData, caption, miniAppUrl, communityId);
      }
      
      console.log('[TelegramSender] Photo message sent successfully');
      return true;
    } 
    else if (photoData && (photoData.startsWith('http://') || photoData.startsWith('https://'))) {
      // This is a URL, send it directly
      return await sendPhotoAsUrlOrFallback(botToken, chatId, photoData, caption, miniAppUrl, communityId);
    } 
    else {
      console.log('[TelegramSender] Invalid photo data format, falling back to text message');
      return await sendTextMessage(botToken, chatId, caption, miniAppUrl, communityId);
    }
  } catch (error) {
    console.error('[TelegramSender] Error sending photo message:', error);
    console.log('[TelegramSender] Falling back to text-only message due to exception');
    // On any exception, try to at least send the text
    try {
      return await sendTextMessage(botToken, chatId, caption, miniAppUrl, communityId);
    } catch (fallbackError) {
      console.error('[TelegramSender] Even fallback message failed:', fallbackError);
      return false;
    }
  }
}

// Helper function to try sending the photo as a URL or fall back to text message
async function sendPhotoAsUrlOrFallback(
  botToken: string,
  chatId: number | string,
  photoUrl: string,
  caption: string,
  miniAppUrl: string,
  communityId: string
): Promise<boolean> {
  try {
    console.log('[TelegramSender] Trying to send photo as URL');
    
    const inlineKeyboard = {
      inline_keyboard: [
        [
          {
            text: "Join Community 🚀",
            web_app: {
              url: `${miniAppUrl}?start=${communityId}`
            }
          }
        ]
      ]
    };
    
    const response = await fetch(
      `https://api.telegram.org/bot${botToken}/sendPhoto`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
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
    
    const data = await response.json();
    
    if (!data.ok) {
      console.error('[TelegramSender] Error sending photo as URL:', data);
      console.log('[TelegramSender] Falling back to text-only message');
      return await sendTextMessage(botToken, chatId, caption, miniAppUrl, communityId);
    }
    
    console.log('[TelegramSender] Photo message sent successfully as URL');
    return true;
  } catch (error) {
    console.error('[TelegramSender] Error sending photo as URL:', error);
    return await sendTextMessage(botToken, chatId, caption, miniAppUrl, communityId);
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
    
    let inlineKeyboard = {};
    
    // Only add the inline keyboard if we have a miniAppUrl and communityId
    if (miniAppUrl && communityId) {
      inlineKeyboard = {
        inline_keyboard: [
          [
            {
              text: "Join Community 🚀",
              web_app: {
                url: `${miniAppUrl}?start=${communityId}`
              }
            }
          ]
        ]
      };
    }

    const response = await fetch(
      `https://api.telegram.org/bot${botToken}/sendMessage`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chat_id: chatId,
          text: text,
          parse_mode: 'HTML',
          reply_markup: inlineKeyboard
        }),
      }
    );

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
    const response = await fetch(
      `https://api.telegram.org/bot${botToken}/getMe`
    );
    
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
