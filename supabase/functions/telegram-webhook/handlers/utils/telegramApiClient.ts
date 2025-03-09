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
        throw new Error(`API error: ${result.description}`);
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
    return this.callApi('approveChatJoinRequest', {
      chat_id: chatId,
      user_id: userId
    });
  }
  
  /**
   * Reject a chat join request
   */
  async rejectJoinRequest(chatId: string, userId: string): Promise<any> {
    return this.callApi('declineChatJoinRequest', {
      chat_id: chatId,
      user_id: userId
    });
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
   */
  async unbanChatMember(chatId: string, userId: string, onlyIfBanned: boolean = false): Promise<any> {
    return this.callApi('unbanChatMember', {
      chat_id: chatId,
      user_id: userId,
      only_if_banned: onlyIfBanned
    });
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
