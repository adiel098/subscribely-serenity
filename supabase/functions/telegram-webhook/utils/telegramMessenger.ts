
/**
 * Utility functions for sending messages to Telegram
 */

/**
 * Validates that a URL is a proper HTTPS URL for Telegram web_app buttons
 */
export function isValidTelegramUrl(url: string): boolean {
  if (!url) return false;
  
  try {
    const parsedUrl = new URL(url);
    return parsedUrl.protocol === 'https:';
  } catch (e) {
    return false;
  }
}

/**
 * Sends a message to a Telegram chat
 * 
 * @param botToken The Telegram bot token
 * @param chatId The chat ID to send the message to
 * @param text The message text, supports HTML formatting
 * @param replyMarkup Optional keyboard markup (inline buttons, etc)
 * @returns Result from Telegram API
 */
export async function sendTelegramMessage(
  botToken: string,
  chatId: string | number,
  text: string,
  replyMarkup: any = null
): Promise<{ ok: boolean; description?: string; result?: any }> {
  console.log(`Sending message to chat ${chatId}`);
  
  try {
    const messageData: any = {
      chat_id: chatId,
      text: text,
      parse_mode: 'HTML',
      disable_web_page_preview: true
    };
    
    if (replyMarkup) {
      messageData.reply_markup = typeof replyMarkup === 'string' 
        ? replyMarkup 
        : JSON.stringify(replyMarkup);
    }
    
    const response = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(messageData)
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      console.error(`Failed to send Telegram message: ${data.description}`);
      return { ok: false, description: data.description };
    }
    
    return { ok: true, result: data.result };
  } catch (error) {
    console.error(`Error sending message:`, error);
    return { ok: false, description: error.message };
  }
}
