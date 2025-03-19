
/**
 * Client for interacting with Telegram Bot API
 */
export class TelegramApiClient {
  private botToken: string;
  
  constructor(botToken: string) {
    this.botToken = botToken;
  }
  
  /**
   * Send a message to a Telegram user/chat
   */
  async sendMessage(chatId: string, text: string, replyMarkup?: any): Promise<any> {
    console.log(`[Telegram API Client] Sending message to chat ${chatId}`);
    
    const url = `https://api.telegram.org/bot${this.botToken}/sendMessage`;
    
    const body: any = {
      chat_id: chatId,
      text: text,
      parse_mode: "HTML"
    };
    
    if (replyMarkup) {
      body.reply_markup = typeof replyMarkup === 'string'
        ? replyMarkup
        : JSON.stringify(replyMarkup);
    }

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      
      const responseData = await response.json();
      
      if (!responseData.ok) {
        console.error(`[Telegram API Client] Error: ${responseData.description}`);
        throw new Error(responseData.description);
      }
      
      return responseData;
    } catch (error) {
      console.error(`[Telegram API Client] Error sending message:`, error);
      throw error;
    }
  }
  
  /**
   * Create an invite link for a Telegram chat
   */
  async createChatInviteLink(chatId: string, name?: string): Promise<any> {
    console.log(`[Telegram API Client] Creating invite link for chat ${chatId}`);
    
    const url = `https://api.telegram.org/bot${this.botToken}/createChatInviteLink`;
    
    const body: any = {
      chat_id: chatId,
      name: name || `Invite created at ${new Date().toISOString()}`
    };

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      
      return await response.json();
    } catch (error) {
      console.error(`[Telegram API Client] Error creating invite link:`, error);
      throw error;
    }
  }
}
