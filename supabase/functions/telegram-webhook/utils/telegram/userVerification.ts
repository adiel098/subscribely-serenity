
/**
 * Utilities for verifying Telegram user capabilities
 */

/**
 * Check if the bot can message a specific user
 * @param botToken Bot token to use
 * @param userId User ID to check
 * @returns True if the bot can message the user
 */
export async function canMessageUser(
  botToken: string,
  userId: string | number
): Promise<boolean> {
  try {
    console.log(`[TELEGRAM-USER] Checking if bot can message user ${userId}`);
    
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
    
    const result = await response.json();
    
    if (result.ok) {
      console.log(`[TELEGRAM-USER] ✅ Bot can message user ${userId}`);
      return true;
    } else {
      console.log(`[TELEGRAM-USER] ❌ Bot cannot message user ${userId}: ${result.description}`);
      return false;
    }
  } catch (error) {
    console.error(`[TELEGRAM-USER] ❌ Error checking if bot can message user:`, error);
    return false;
  }
}

/**
 * Get chat member information from Telegram
 * @param botToken Bot token to use
 * @param chatId Chat ID
 * @param userId User ID to check
 * @returns The chat member information or null if not found
 */
export async function getChatMember(
  botToken: string,
  chatId: string | number,
  userId: string | number
): Promise<any | null> {
  try {
    console.log(`[TELEGRAM-USER] Getting chat member info for user ${userId} in chat ${chatId}`);
    
    const response = await fetch(
      `https://api.telegram.org/bot${botToken}/getChatMember`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          chat_id: chatId,
          user_id: userId
        })
      }
    );
    
    const result = await response.json();
    
    if (result.ok) {
      return result.result;
    } else {
      console.log(`[TELEGRAM-USER] ❌ Failed to get chat member: ${result.description}`);
      return null;
    }
  } catch (error) {
    console.error(`[TELEGRAM-USER] ❌ Error getting chat member:`, error);
    return null;
  }
}
