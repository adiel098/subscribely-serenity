
export class TelegramApiClient {
  private botToken: string;
  
  constructor(botToken: string) {
    this.botToken = botToken;
  }
  
  /**
   * Kick a chat member
   */
  async kickChatMember(chatId: string, userId: string): Promise<{
    success: boolean;
    error?: string;
  }> {
    try {
      console.log(`[TelegramApi] Attempting to kick user ${userId} from chat ${chatId}`);
      
      // First try to ban the member with a short duration (Telegram's recommended way to kick)
      const banResponse = await fetch(`https://api.telegram.org/bot${this.botToken}/banChatMember`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          user_id: userId,
          until_date: Math.floor(Date.now() / 1000) + 40, // 40 seconds (minimum allowed by Telegram)
        }),
      });
      
      const banResult = await banResponse.json();
      
      if (!banResult.ok) {
        console.error(`[TelegramApi] Failed to kick user: ${banResult.description}`);
        return {
          success: false,
          error: banResult.description
        };
      }
      
      console.log(`[TelegramApi] Successfully kicked user ${userId}`);
      
      // After a short delay, unban the user to allow them to rejoin only if they get a new invite link
      // Wait 2 seconds before unbanning
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      console.log(`[TelegramApi] Now unbanning user ${userId} so they can rejoin in the future with a new invite link`);
      
      const unbanResponse = await fetch(`https://api.telegram.org/bot${this.botToken}/unbanChatMember`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          user_id: userId,
          only_if_banned: true,
        }),
      });
      
      const unbanResult = await unbanResponse.json();
      
      if (!unbanResult.ok) {
        console.warn(`[TelegramApi] Failed to unban user: ${unbanResult.description}`);
        // Don't return false here, as the kick operation was still successful
      } else {
        console.log(`[TelegramApi] Successfully unbanned user ${userId}`);
      }
      
      return { success: true };
    } catch (error) {
      console.error(`[TelegramApi] Error in kickChatMember: ${error.message}`);
      return {
        success: false,
        error: error.message
      };
    }
  }
}
