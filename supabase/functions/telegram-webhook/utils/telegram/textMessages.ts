
import { getApiHeaders, formatReplyMarkup } from "./coreClient.ts";

/**
 * Send a text message to a Telegram chat
 */
export async function sendTelegramMessage(
  botToken: string,
  chatId: string | number,
  text: string,
  replyMarkup: any = null
): Promise<any> {
  console.log(`[Telegram Client] Sending message to chat ${chatId}`);
  
  const url = `https://api.telegram.org/bot${botToken}/sendMessage`;
  
  const body: any = {
    chat_id: chatId,
    text: text,
    parse_mode: "HTML"
  };
  
  if (replyMarkup) {
    // Ensure reply markup is properly formatted
    body.reply_markup = formatReplyMarkup(replyMarkup);
    console.log(`[Telegram Client] Including reply markup:`, typeof replyMarkup === 'string' ? replyMarkup : JSON.stringify(replyMarkup));
  }

  try {
    console.log(`[Telegram Client] Making API request to: ${url}`);
    const response = await fetch(url, {
      method: "POST",
      headers: getApiHeaders(),
      body: JSON.stringify(body)
    });
    
    const responseData = await response.json();
    
    if (!responseData.ok) {
      console.error(`[Telegram Client] API Error: ${responseData.description}`);
      console.error(`[Telegram Client] Request body was:`, JSON.stringify(body));
      throw new Error(responseData.description);
    }
    
    console.log(`[Telegram Client] Message sent successfully to ${chatId}`);
    return responseData;
  } catch (error) {
    console.error(`[Telegram Client] Error sending message:`, error);
    throw error;
  }
}
