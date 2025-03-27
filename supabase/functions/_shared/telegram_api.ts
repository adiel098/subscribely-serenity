
/**
 * Client for interacting with the Telegram Bot API
 */
export class TelegramApiClient {
  private botToken: string;
  
  constructor(botToken: string) {
    this.botToken = botToken;
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
   * Kick a user from a chat
   */
  async kickChatMember(chatId: string, userId: string): Promise<any> {
    console.log(`[TELEGRAM-API] 🚫 Kicking user ${userId} from chat ${chatId}`);
    
    try {
      const result = await this.callApi('banChatMember', {
        chat_id: chatId,
        user_id: userId,
        until_date: Math.floor(Date.now() / 1000) + 40 // 40 seconds ban (minimum allowed)
      });
      
      if (result.ok) {
        console.log(`[TELEGRAM-API] ✅ Successfully kicked user ${userId}`);
        
        // Unban after a short delay so they can rejoin if needed
        setTimeout(async () => {
          try {
            await this.unbanChatMember(chatId, userId);
          } catch (error) {
            console.error(`[TELEGRAM-API] ❌ Error unbanning user:`, error);
          }
        }, 2000);
      } else {
        console.log(`[TELEGRAM-API] ⚠️ Kick response for user ${userId}: ${result.description}`);
      }
      
      return {
        success: result.ok,
        error: result.ok ? null : result.description
      };
    } catch (error) {
      console.error(`[TELEGRAM-API] ❌ Error kicking user ${userId} from chat ${chatId}:`, error);
      return {
        success: false,
        error: error.message
      };
    }
  }
  
  /**
   * Unban a user from a chat
   */
  async unbanChatMember(chatId: string, userId: string): Promise<any> {
    console.log(`[TELEGRAM-API] 🔓 Unbanning user ${userId} from chat ${chatId}`);
    
    try {
      const result = await this.callApi('unbanChatMember', {
        chat_id: chatId,
        user_id: userId,
        only_if_banned: true
      });
      
      if (result.ok) {
        console.log(`[TELEGRAM-API] ✅ User ${userId} successfully unbanned from chat ${chatId}`);
      } else {
        console.log(`[TELEGRAM-API] ⚠️ Unban response for user ${userId}: ${result.description}`);
      }
      
      return {
        success: result.ok,
        error: result.ok ? null : result.description
      };
    } catch (error) {
      console.error(`[TELEGRAM-API] ❌ Error unbanning user ${userId} from chat ${chatId}:`, error);
      return {
        success: false,
        error: error.message
      };
    }
  }
}
