
/**
 * Utility for sending messages through Telegram Bot API
 */
export async function sendTelegramMessage(
  botToken: string,
  chatId: string | number,
  text: string,
  options?: any
) {
  try {
    console.log(`Sending message to chat ${chatId}`);
    
    const url = `https://api.telegram.org/bot${botToken}/sendMessage`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: chatId,
        text: text,
        parse_mode: 'HTML',
        ...options
      }),
    });

    const responseData = await response.json();
    
    if (!responseData.ok) {
      console.error('Telegram API error:', responseData);
      throw new Error(`Telegram API error: ${JSON.stringify(responseData)}`);
    }
    
    console.log('Message sent successfully');
    return responseData;
  } catch (error) {
    console.error('Error sending Telegram message:', error);
    throw error;
  }
}

/**
 * Send a message with an image
 */
export async function sendTelegramPhotoMessage(
  botToken: string,
  chatId: string | number,
  photoUrl: string,
  caption: string = '',
  options?: any
) {
  try {
    console.log(`Sending photo message to chat ${chatId}`);
    
    const url = `https://api.telegram.org/bot${botToken}/sendPhoto`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: chatId,
        photo: photoUrl,
        caption: caption,
        parse_mode: 'HTML',
        ...options
      }),
    });

    const responseData = await response.json();
    
    if (!responseData.ok) {
      console.error('Telegram API error:', responseData);
      throw new Error(`Telegram API error: ${JSON.stringify(responseData)}`);
    }
    
    console.log('Photo message sent successfully');
    return responseData;
  } catch (error) {
    console.error('Error sending Telegram photo message:', error);
    throw error;
  }
}

/**
 * Send a private message to a user
 */
export async function sendPrivateMessage(
  botToken: string,
  userId: string | number,
  text: string,
  options?: any
) {
  try {
    return await sendTelegramMessage(botToken, userId, text, options);
  } catch (error) {
    console.error(`Error sending private message to user ${userId}:`, error);
    throw error;
  }
}

/**
 * Ban a user from a chat
 */
export async function banChatMember(
  botToken: string,
  chatId: string | number,
  userId: string | number,
  options?: any
) {
  try {
    console.log(`Banning user ${userId} from chat ${chatId}`);
    
    const url = `https://api.telegram.org/bot${botToken}/banChatMember`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: chatId,
        user_id: userId,
        ...options
      }),
    });

    const responseData = await response.json();
    
    if (!responseData.ok) {
      console.error('Telegram API error:', responseData);
      throw new Error(`Telegram API error: ${JSON.stringify(responseData)}`);
    }
    
    console.log('User banned successfully');
    return responseData;
  } catch (error) {
    console.error(`Error banning user ${userId} from chat ${chatId}:`, error);
    throw error;
  }
}

/**
 * Kick a user from a chat (ban then unban to remove them without preventing future joins)
 */
export async function kickChatMember(
  botToken: string,
  chatId: string | number,
  userId: string | number
) {
  try {
    console.log(`Kicking user ${userId} from chat ${chatId}`);
    
    // First ban the user
    await banChatMember(botToken, chatId, userId);
    
    // Then unban to allow them to rejoin
    const unbanUrl = `https://api.telegram.org/bot${botToken}/unbanChatMember`;
    
    const response = await fetch(unbanUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: chatId,
        user_id: userId,
        only_if_banned: true
      }),
    });

    const responseData = await response.json();
    
    if (!responseData.ok) {
      console.error('Telegram API error during unban:', responseData);
      throw new Error(`Telegram API error during unban: ${JSON.stringify(responseData)}`);
    }
    
    console.log('User kicked successfully');
    return responseData;
  } catch (error) {
    console.error(`Error kicking user ${userId} from chat ${chatId}:`, error);
    throw error;
  }
}

/**
 * Get chat information from Telegram
 */
export async function getChatInfo(
  botToken: string,
  chatId: string | number
) {
  try {
    console.log(`Getting chat info for ${chatId}`);
    
    const url = `https://api.telegram.org/bot${botToken}/getChat`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: chatId
      }),
    });

    const responseData = await response.json();
    
    if (!responseData.ok) {
      console.error('Telegram API error:', responseData);
      throw new Error(`Telegram API error: ${JSON.stringify(responseData)}`);
    }
    
    console.log('Chat info retrieved successfully');
    return responseData.result;
  } catch (error) {
    console.error(`Error getting chat info for ${chatId}:`, error);
    throw error;
  }
}
