
import { getApiHeaders } from "./coreClient.ts";

/**
 * Verify if a user can receive messages from the bot
 * @returns true if the bot can message the user, false otherwise
 */
export async function canMessageUser(
  botToken: string,
  userId: string | number
): Promise<boolean> {
  try {
    console.log(`[Telegram Client] Checking if bot can message user ${userId}`);
    
    const url = `https://api.telegram.org/bot${botToken}/getChat`;
    const response = await fetch(url, {
      method: "POST",
      headers: getApiHeaders(),
      body: JSON.stringify({
        chat_id: userId
      })
    });
    
    const data = await response.json();
    
    if (data.ok) {
      console.log(`[Telegram Client] Bot can message user ${userId}`);
      return true;
    } else {
      console.log(`[Telegram Client] Bot cannot message user ${userId}: ${data.description}`);
      return false;
    }
  } catch (error) {
    console.error(`[Telegram Client] Error checking if bot can message user:`, error);
    return false;
  }
}
