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

  /**
   * Factory method to create a TelegramApiClient with the appropriate token
   * based on community settings
   */
  static async getClientForCommunity(supabase: any, communityId: string, defaultBotToken: string): Promise<TelegramApiClient> {
    try {
      console.log(`[Telegram API Client] Getting client for community ${communityId}`);
      
      // Get bot settings for this community
      const { data, error } = await supabase
        .from('telegram_bot_settings')
        .select('use_custom_bot, custom_bot_token')
        .eq('community_id', communityId)
        .single();
      
      if (error) {
        console.error(`[Telegram API Client] Error fetching bot settings:`, error);
        // Fallback to default bot
        return new TelegramApiClient(defaultBotToken);
      }
      
      // If custom bot is enabled and token is available, use it
      if (data?.use_custom_bot && data?.custom_bot_token) {
        console.log(`[Telegram API Client] Using custom bot for community ${communityId}`);
        return new TelegramApiClient(data.custom_bot_token);
      }
      
      // Otherwise use default bot
      console.log(`[Telegram API Client] Using default bot for community ${communityId}`);
      return new TelegramApiClient(defaultBotToken);
    } catch (error) {
      console.error(`[Telegram API Client] Error creating client:`, error);
      // Fallback to default bot in case of any error
      return new TelegramApiClient(defaultBotToken);
    }
  }
}
