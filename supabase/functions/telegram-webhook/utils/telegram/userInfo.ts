
/**
 * Utility functions for retrieving Telegram user information
 */

/**
 * Get user information from Telegram
 * @param botToken Telegram bot token
 * @param userId Telegram user ID
 * @returns User information if available
 */
export async function getTelegramUserInfo(botToken: string, userId: string): Promise<{
  first_name?: string;
  last_name?: string;
  username?: string;
  success: boolean;
}> {
  try {
    console.log(`[TELEGRAM-USER-INFO] 🔍 Getting information for user ${userId}`);
    
    // Call Telegram API to get user information
    const response = await fetch(`https://api.telegram.org/bot${botToken}/getChat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ chat_id: userId })
    });
    
    const data = await response.json();
    
    if (!data.ok) {
      console.error(`[TELEGRAM-USER-INFO] ❌ Error from Telegram API: ${data.description}`);
      return { success: false };
    }
    
    console.log(`[TELEGRAM-USER-INFO] ✅ Successfully retrieved information for user ${userId}`);
    
    return {
      first_name: data.result.first_name,
      last_name: data.result.last_name,
      username: data.result.username,
      success: true
    };
  } catch (error) {
    console.error(`[TELEGRAM-USER-INFO] ❌ Exception getting user info: ${error}`);
    return { success: false };
  }
}
