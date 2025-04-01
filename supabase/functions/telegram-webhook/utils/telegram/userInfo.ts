
/**
 * Utilities to get information about a Telegram user
 */

/**
 * Get information about a Telegram user 
 */
export async function getTelegramUserInfo(
  botToken: string,
  userId: string | number
): Promise<any | null> {
  try {
    console.log(`[USER-INFO] Getting info for user ${userId}`);
    
    // Try to get chat info
    const response = await fetch(
      `https://api.telegram.org/bot${botToken}/getChat`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          chat_id: userId
        })
      }
    );
    
    const data = await response.json();
    
    if (!response.ok) {
      console.error(`[USER-INFO] ❌ Failed to get user info: ${data.description}`);
      return null;
    }
    
    console.log(`[USER-INFO] ✅ Successfully retrieved user info for ${userId}`);
    return data.result;
  } catch (error) {
    console.error(`[USER-INFO] ❌ Error getting user info:`, error);
    return null;
  }
}
