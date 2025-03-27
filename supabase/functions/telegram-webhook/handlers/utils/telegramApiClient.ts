
/**
 * Client for interacting with the Telegram Bot API
 */
export class TelegramApiClient {
  private botToken: string;
  
  constructor(botToken: string) {
    this.botToken = botToken;
  }
  
  /**
   * Ban a user from a chat
   */
  async banChatMember(chatId: string, userId: string, untilDate: number = 0): Promise<any> {
    console.log(`[TELEGRAM-API] 🚫 Banning user ${userId} from chat ${chatId}`);
    
    try {
      const url = `https://api.telegram.org/bot${this.botToken}/banChatMember`;
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          chat_id: chatId,
          user_id: userId,
          until_date: untilDate
        })
      });
      
      const result = await response.json();
      
      if (!result.ok) {
        console.error(`[TELEGRAM-API] ❌ Ban error: ${result.description}`);
      } else {
        console.log(`[TELEGRAM-API] ✅ Successfully banned user ${userId}`);
      }
      
      return result;
    } catch (error) {
      console.error(`[TELEGRAM-API] ❌ Exception in banChatMember: ${error.message}`);
      throw error;
    }
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
      const url = `https://api.telegram.org/bot${this.botToken}/unbanChatMember`;
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          chat_id: chatId,
          user_id: userId,
          only_if_banned: onlyIfBanned
        })
      });
      
      const result = await response.json();
      
      if (!result.ok) {
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
      } else {
        console.log(`[TELEGRAM-API] ✅ User ${userId} successfully unbanned from chat ${chatId}`);
      }
      
      return result;
    } catch (error) {
      console.error(`[TELEGRAM-API] ❌ Error unbanning user ${userId} from chat ${chatId}: ${error}`);
      throw error;
    }
  }
  
  /**
   * Send a message to a chat
   */
  async sendMessage(chatId: string, text: string, parseMode: string = 'HTML', replyMarkup: any = null): Promise<any> {
    try {
      const url = `https://api.telegram.org/bot${this.botToken}/sendMessage`;
      
      const body: any = {
        chat_id: chatId,
        text: text,
        parse_mode: parseMode
      };
      
      if (replyMarkup) {
        body.reply_markup = typeof replyMarkup === 'string' 
          ? replyMarkup 
          : JSON.stringify(replyMarkup);
      }
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      });
      
      return await response.json();
    } catch (error) {
      console.error(`[TELEGRAM-API] ❌ Error sending message: ${error.message}`);
      throw error;
    }
  }
}
