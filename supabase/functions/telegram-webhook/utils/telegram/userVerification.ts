
/**
 * Utilities to verify if a user can be messaged
 */

/**
 * Check if the bot can message a user
 */
export async function canMessageUser(
  botToken: string,
  userId: string | number
): Promise<boolean> {
  try {
    console.log(`[USER-VERIFY] Checking if bot can message user ${userId}`);
    
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
      console.error(`[USER-VERIFY] ❌ Cannot message user: ${data.description}`);
      return false;
    }
    
    console.log(`[USER-VERIFY] ✅ Bot can message user ${userId}`);
    return true;
  } catch (error) {
    console.error(`[USER-VERIFY] ❌ Error checking user:`, error);
    return false;
  }
}
