
/**
 * Client for interacting with the Telegram Bot API
 */
export class TelegramApiClient {
  private botToken: string;
  
  constructor(botToken: string) {
    this.botToken = botToken;
  }
  
  /**
   * Safely gets the bot token for internal use
   * This should only be used by trusted internal functions
   */
  getBotToken(): string {
    return this.botToken;
  }
  
  /**
   * Base method to call the Telegram API
   */
  private async callApi(method: string, body: any): Promise<any> {
    try {
      console.log(`[TELEGRAM-API] 🔄 Calling method ${method}`);
      
      const response = await fetch(`https://api.telegram.org/bot${this.botToken}/${method}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      });
      
      if (!response.ok) {
        console.error(`[TELEGRAM-API] ❌ HTTP error: ${response.status}`);
        const errorText = await response.text();
        console.error(`[TELEGRAM-API] Response: ${errorText}`);
        throw new Error(`HTTP error: ${response.status}`);
      }
      
      const result = await response.json();
      
      if (!result.ok) {
        console.error(`[TELEGRAM-API] ❌ API error: ${result.description}`);
        return result; // Return the error response so we can handle it
      }
      
      return result;
    } catch (error) {
      console.error(`[TELEGRAM-API] ❌ Exception in ${method}:`, error);
      throw error;
    }
  }
  
  /**
   * Approve a chat join request
   */
  async approveJoinRequest(chatId: string, userId: string): Promise<any> {
    console.log(`[TELEGRAM-API] ✅ Approving join request for user ${userId} in chat ${chatId}`);
    try {
      const result = await this.callApi('approveChatJoinRequest', {
        chat_id: chatId,
        user_id: userId
      });
      
      if (result.ok) {
        console.log(`[TELEGRAM-API] ✅ Successfully approved join request for user ${userId}`);
      } else {
        console.warn(`[TELEGRAM-API] ⚠️ Failed to approve join request: ${result.description}`);
      }
      
      return result;
    } catch (error) {
      console.error(`[TELEGRAM-API] ❌ Error approving join request for user ${userId}:`, error);
      throw error;
    }
  }
  
  /**
   * Reject a chat join request
   */
  async rejectJoinRequest(chatId: string, userId: string): Promise<any> {
    console.log(`[TELEGRAM-API] ❌ Rejecting join request for user ${userId} in chat ${chatId}`);
    try {
      const result = await this.callApi('declineChatJoinRequest', {
        chat_id: chatId,
        user_id: userId
      });
      
      if (result.ok) {
        console.log(`[TELEGRAM-API] ✅ Successfully rejected join request for user ${userId}`);
      } else {
        console.warn(`[TELEGRAM-API] ⚠️ Failed to reject join request: ${result.description}`);
      }
      
      return result;
    } catch (error) {
      console.error(`[TELEGRAM-API] ❌ Error rejecting join request for user ${userId}:`, error);
      throw error;
    }
  }
  
  /**
   * Ban a user from a chat
   */
  async banChatMember(chatId: string, userId: string, untilDate: number = 0, revokeMessages: boolean = false): Promise<any> {
    return this.callApi('banChatMember', {
      chat_id: chatId,
      user_id: userId,
      until_date: untilDate,
      revoke_messages: revokeMessages
    });
  }
  
  /**
   * Unban a user from a chat
   * 
   * @param chatId The chat ID
   * @param userId The user ID to unban
   * @param onlyIfBanned Whether to only unban the user if they're currently banned
   * @returns The API response
   */
  async unbanChatMember(chatId: string, userId: string, onlyIfBanned: boolean = true): Promise<any> {
    console.log(`[TELEGRAM-API] 🔓 Unbanning user ${userId} from chat ${chatId}, onlyIfBanned: ${onlyIfBanned}`);
    
    try {
      const result = await this.callApi('unbanChatMember', {
        chat_id: chatId,
        user_id: userId,
        only_if_banned: onlyIfBanned
      });
      
      if (result.ok) {
        console.log(`[TELEGRAM-API] ✅ User ${userId} successfully unbanned from chat ${chatId}`);
      } else {
        console.log(`[TELEGRAM-API] ⚠️ Unban response for user ${userId}: ${result.description}`);
        
        // Check if the user is not a member of the chat (common error)
        if (result.description && (
            result.description.includes("not found") || 
            result.description.includes("USER_NOT_PARTICIPANT") || 
            result.description.includes("user is not a member")
        )) {
          console.log(`[TELEGRAM-API] ℹ️ User ${userId} is not a member of chat ${chatId}, treating as successful unban`);
          // Return a "success" response since the user is not banned in the chat
          return { ok: true, result: true, description: "User is not a member of the chat, no unban needed" };
        }
      }
      
      return result;
    } catch (error) {
      console.error(`[TELEGRAM-API] ❌ Error unbanning user ${userId} from chat ${chatId}:`, error);
      throw error;
    }
  }
  
  /**
   * Send a message to a chat
   */
  async sendMessage(chatId: string, text: string, parseMode: string = 'HTML', replyMarkup: any = null): Promise<any> {
    const body: any = {
      chat_id: chatId,
      text: text,
      parse_mode: parseMode
    };
    
    if (replyMarkup) {
      body.reply_markup = replyMarkup;
    }
    
    return this.callApi('sendMessage', body);
  }
  
  /**
   * Create an invite link for a chat
   */
  async createChatInviteLink(chatId: string, name: string, expireDate: number = 0, memberLimit: number = 0): Promise<any> {
    const body: any = {
      chat_id: chatId,
      name: name
    };
    
    if (expireDate > 0) {
      body.expire_date = expireDate;
    }
    
    if (memberLimit > 0) {
      body.member_limit = memberLimit;
    }
    
    return this.callApi('createChatInviteLink', body);
  }
  
  /**
   * Get information about a chat
   */
  async getChat(chatId: string): Promise<any> {
    return this.callApi('getChat', {
      chat_id: chatId
    });
  }
}
