
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
    console.log('[TelegramSender] Photo data length:', (photoData || '').length);
    
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

    // Handle Base64 data
    let formData: FormData | null = null;
    let requestOptions: any = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: ''
    };

    if (photoData && photoData.startsWith('data:image')) {
      // This is a Base64 encoded image, we need to convert it to a file/buffer
      console.log('[TelegramSender] Detected Base64 image, converting for Telegram API');
      
      // Extract the Base64 content without the data URL prefix
      const base64Data = photoData.split(',')[1];
      
      // Create a buffer from the Base64 data
      const imageBuffer = Buffer.from(base64Data, 'base64');
      
      // Use multipart/form-data to send the image
      formData = new FormData();
      
      // Create a Blob from the buffer
      const blob = new Blob([imageBuffer], { type: 'image/jpeg' });
      
      // Append the photo, caption, chat_id, and reply_markup to the form data
      formData.append('photo', blob, 'welcome_image.jpg');
      formData.append('caption', caption);
      formData.append('chat_id', chatId.toString());
      formData.append('parse_mode', 'HTML');
      formData.append('reply_markup', JSON.stringify(inlineKeyboard));
      
      // Update request options for form data
      requestOptions = {
        method: 'POST',
        body: formData
      };
    } else if (photoData && (photoData.startsWith('http://') || photoData.startsWith('https://'))) {
      // This is a URL, send it directly
      console.log('[TelegramSender] Detected URL image');
      requestOptions.body = JSON.stringify({
        chat_id: chatId,
        photo: photoData,
        caption: caption,
        parse_mode: 'HTML',
        reply_markup: inlineKeyboard
      });
    } else {
      console.log('[TelegramSender] Invalid photo data format, falling back to text message');
      return await sendTextMessage(botToken, chatId, caption, miniAppUrl, communityId);
    }

    const response = await fetch(
      `https://api.telegram.org/bot${botToken}/sendPhoto`,
      requestOptions
    );

    const data = await response.json();
    
    if (!data.ok) {
      console.error('[TelegramSender] Error sending photo message:', data);
      console.log('[TelegramSender] Falling back to text-only message');
      // If photo sending fails, fall back to sending just the text
      return await sendTextMessage(botToken, chatId, caption, miniAppUrl, communityId);
    }
    
    console.log('[TelegramSender] Photo message sent successfully');
    return true;
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
