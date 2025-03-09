
import { corsHeaders } from '../../cors.ts';

/**
 * Client for interacting with Telegram API
 */
export class TelegramApiClient {
  private botToken: string;

  constructor(botToken: string) {
    this.botToken = botToken;
  }

  /**
   * Approves a join request for a user to a chat
   * @param chatId The chat ID
   * @param userId The user ID to approve
   * @returns The result from Telegram API
   */
  async approveJoinRequest(chatId: string, userId: string) {
    try {
      console.log(`[TELEGRAM-API] 🔄 Approving join request for user ${userId} in chat ${chatId}`);
      const response = await fetch(`https://api.telegram.org/bot${this.botToken}/approveChatJoinRequest`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          user_id: userId
        })
      });
      
      const result = await response.json();
      console.log('[TELEGRAM-API] Approve join request raw response:', result);
      
      if (!result.ok) {
        console.error(`[TELEGRAM-API] ❌ Telegram API error when approving join request:`, result);
      }
      
      return result;
    } catch (error) {
      console.error('[TELEGRAM-API] ❌ Error approving join request:', error);
      throw error;
    }
  }

  /**
   * Rejects a join request for a user to a chat
   * @param chatId The chat ID
   * @param userId The user ID to reject
   * @returns The result from Telegram API
   */
  async rejectJoinRequest(chatId: string, userId: string) {
    try {
      console.log(`[TELEGRAM-API] 🔄 Rejecting join request for user ${userId} in chat ${chatId}`);
      const response = await fetch(`https://api.telegram.org/bot${this.botToken}/declineChatJoinRequest`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          user_id: userId
        })
      });
      
      const result = await response.json();
      console.log('[TELEGRAM-API] Reject join request raw response:', result);
      
      if (!result.ok) {
        console.error(`[TELEGRAM-API] ❌ Telegram API error when rejecting join request:`, result);
      }
      
      return result;
    } catch (error) {
      console.error('[TELEGRAM-API] ❌ Error rejecting join request:', error);
      throw error;
    }
  }
}
