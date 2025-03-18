
// Re-exporting from new modular files for backwards compatibility
export { handleChatMemberUpdate } from './handlers/memberUpdateHandler.ts';
export { handleMyChatMember } from './handlers/botStatusHandler.ts';
export { updateMemberActivity } from './handlers/utils/activityUtils.ts';

// Helper function to check if the bot can message a user
export async function getBotChatMember(
  botToken: string,
  userId: string | number,
  chatId: string | number
): Promise<boolean> {
  try {
    console.log(`[Member Handler] Checking if bot can message user ${userId}`);
    
    const url = `https://api.telegram.org/bot${botToken}/getChat`;
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        chat_id: userId
      })
    });
    
    const data = await response.json();
    
    if (data.ok) {
      console.log(`[Member Handler] Bot can message user ${userId}`);
      return true;
    } else {
      console.log(`[Member Handler] Bot cannot message user ${userId}: ${data.description}`);
      return false;
    }
  } catch (error) {
    console.error(`[Member Handler] Error checking if bot can message user:`, error);
    return false;
  }
}
