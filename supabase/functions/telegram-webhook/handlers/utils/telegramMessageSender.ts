
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
    console.log('[TelegramSender] Photo URL:', photoUrl.substring(0, 50) + '...');
    
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
      console.error('[TelegramSender] Error sending photo message:', data);
      return false;
    }
    
    console.log('[TelegramSender] Photo message sent successfully');
    return true;
  } catch (error) {
    console.error('[TelegramSender] Error sending photo message:', error);
    return false;
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
