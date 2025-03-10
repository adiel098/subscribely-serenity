
import { logger } from './logger.ts';

/**
 * Fetch Telegram channel information using Telegram Bot API
 */
export async function fetchTelegramChannelInfo(botToken: string, chatId: string) {
  try {
    logger.debug(`Fetching Telegram channel info for chat ID: ${chatId}`);
    
    if (!botToken) {
      logger.error("TELEGRAM_BOT_TOKEN is not set in environment variables");
      return { ok: false, error: "Bot token not configured" };
    }
    
    // Call the Telegram getChat API
    const telegramApiUrl = `https://api.telegram.org/bot${botToken}/getChat`;
    const telegramResponse = await fetch(telegramApiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ chat_id: chatId })
    });
    
    const telegramData = await telegramResponse.json();
    logger.debug("Telegram API response:", telegramData);
    
    return telegramData;
  } catch (error) {
    logger.error("Error fetching Telegram channel info:", error);
    return { ok: false, error: error.message || "Unknown error" };
  }
}

/**
 * Test if a photo URL is accessible
 */
export async function testPhotoUrl(photoUrl: string) {
  try {
    logger.debug(`Testing if photo URL is accessible: ${photoUrl}`);
    const photoTestResponse = await fetch(photoUrl, { method: 'HEAD' });
    logger.debug(`Photo URL check status: ${photoTestResponse.status} ${photoTestResponse.statusText}`);
    return photoTestResponse.ok;
  } catch (error) {
    logger.error(`Error checking photo URL: ${error.message}`);
    return false;
  }
}
