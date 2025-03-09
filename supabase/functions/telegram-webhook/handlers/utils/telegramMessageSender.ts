
/**
 * Utility functions for sending messages via Telegram Bot API
 */

// Verify a bot token is valid
export async function verifyBotToken(botToken: string): Promise<boolean> {
  try {
    console.log('[TelegramSender] 🔄 Verifying bot token validity');
    const response = await fetch(`https://api.telegram.org/bot${botToken}/getMe`);
    const data = await response.json();
    
    if (!data.ok) {
      console.error('[TelegramSender] ❌ Bot token verification failed:', data);
      return false;
    }
    
    console.log('[TelegramSender] ✅ Bot token verified successfully:', data.result?.username);
    return true;
  } catch (error) {
    console.error('[TelegramSender] ❌ Bot token verification error:', error);
    return false;
  }
}

// Send a text message with button
export async function sendTextMessage(
  botToken: string,
  chatId: string | number,
  text: string,
  miniAppUrl: string,
  communityId: string
): Promise<boolean> {
  try {
    console.log(`[TelegramSender] 📤 Sending text message to chat ${chatId}`);
    
    // Ensure we have a valid bot token and chat ID
    if (!botToken || !chatId) {
      console.error('[TelegramSender] ❌ Missing required parameters:', { 
        hasBotToken: !!botToken, 
        hasChatId: !!chatId 
      });
      return false;
    }
    
    // Prepare the message payload
    const payload = {
      chat_id: chatId,
      text: text,
      parse_mode: 'HTML',
      reply_markup: {
        inline_keyboard: [[
          {
            text: "הצטרף לקהילה 🚀",
            web_app: { url: miniAppUrl }
          }
        ]]
      }
    };
    
    console.log('[TelegramSender] 📦 Message payload:', JSON.stringify(payload, null, 2));
    
    // Send the message
    const response = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    
    // Parse and check the response
    const data = await response.json();
    
    if (!data.ok) {
      console.error('[TelegramSender] ❌ Failed to send text message:', data);
      return false;
    }
    
    console.log('[TelegramSender] ✅ Text message sent successfully:', data.result?.message_id);
    return true;
  } catch (error) {
    console.error('[TelegramSender] ❌ Error sending text message:', error);
    return false;
  }
}

// Send a photo message with caption and button
export async function sendPhotoMessage(
  botToken: string,
  chatId: string | number,
  photoUrl: string,
  caption: string,
  miniAppUrl: string,
  communityId: string
): Promise<boolean> {
  try {
    console.log(`[TelegramSender] 🖼️ Sending photo message to chat ${chatId}`);
    
    // Ensure we have all required parameters
    if (!botToken || !chatId || !photoUrl) {
      console.error('[TelegramSender] ❌ Missing required parameters:', { 
        hasBotToken: !!botToken, 
        hasChatId: !!chatId,
        hasPhotoUrl: !!photoUrl
      });
      return false;
    }
    
    // Prepare the message payload
    const payload = {
      chat_id: chatId,
      photo: photoUrl,
      caption: caption,
      parse_mode: 'HTML',
      reply_markup: {
        inline_keyboard: [[
          {
            text: "הצטרף לקהילה 🚀",
            web_app: { url: miniAppUrl }
          }
        ]]
      }
    };
    
    console.log('[TelegramSender] 📦 Photo message payload:', JSON.stringify(payload, null, 2));
    
    // Send the message
    const response = await fetch(`https://api.telegram.org/bot${botToken}/sendPhoto`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    
    // Parse and check the response
    const data = await response.json();
    
    if (!data.ok) {
      console.error('[TelegramSender] ❌ Failed to send photo message:', data);
      return false;
    }
    
    console.log('[TelegramSender] ✅ Photo message sent successfully:', data.result?.message_id);
    return true;
  } catch (error) {
    console.error('[TelegramSender] ❌ Error sending photo message:', error);
    return false;
  }
}
