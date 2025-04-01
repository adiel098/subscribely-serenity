
import { corsHeaders } from '../cors.ts';

/**
 * Send a text message to a Telegram chat
 */
export async function sendTelegramMessage(
  botToken: string,
  chatId: string | number,
  text: string,
  replyMarkup?: any
): Promise<any> {
  try {
    console.log(`Sending message to chat ${chatId}`);
    
    const payload: any = {
      chat_id: chatId,
      text: text,
      parse_mode: 'HTML'
    };
    
    if (replyMarkup) {
      payload.reply_markup = replyMarkup;
    }
    
    const response = await fetch(
      `https://api.telegram.org/bot${botToken}/sendMessage`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders
        },
        body: JSON.stringify(payload)
      }
    );
    
    const result = await response.json();
    
    if (!result.ok) {
      console.error(`Failed to send message: ${result.description}`);
    }
    
    return result;
  } catch (error) {
    console.error(`Error sending message: ${error.message}`);
    throw error;
  }
}

/**
 * Validate if a URL is valid for Telegram web_app buttons
 * Telegram requires HTTPS URLs
 */
export function isValidTelegramUrl(url: string): boolean {
  try {
    // Check if it's a valid URL
    new URL(url);
    
    // Telegram requires HTTPS for web_app URLs
    return url.startsWith('https://');
  } catch {
    return false;
  }
}
