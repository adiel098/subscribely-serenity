
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { createLogger } from './loggingService.ts';

export class JoinRequestService {
  private supabase: ReturnType<typeof createClient>;
  private botToken: string;
  private logger: ReturnType<typeof createLogger>;
  
  constructor(
    supabase: ReturnType<typeof createClient>, 
    botToken: string
  ) {
    this.supabase = supabase;
    this.botToken = botToken;
    this.logger = createLogger(supabase, 'JOIN-REQUEST-SERVICE');
  }
  
  /**
   * Approve a join request for a Telegram chat
   */
  async approveJoinRequest(
    chatId: string, 
    userId: string,
    username?: string,
    reason?: string
  ): Promise<boolean> {
    try {
      await this.logger.info(`Approving join request for user ${userId} in chat ${chatId}`);
      
      const url = `https://api.telegram.org/bot${this.botToken}/approveChatJoinRequest`;
      
      const response = await fetch(url, {
        method: "POST",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          user_id: userId
        })
      });
      
      const data = await response.json();
      
      if (data.ok) {
        await this.logger.success(`Successfully approved join request for user ${userId}`);
        
        // Log the activity
        await this.supabase
          .from('telegram_join_request_logs')
          .insert({
            telegram_chat_id: chatId,
            telegram_user_id: userId,
            telegram_username: username,
            event_type: 'approved',
            details: reason || 'Approved by system'
          });
          
        return true;
      } else {
        await this.logger.error(`Failed to approve join request: ${data.description}`);
        return false;
      }
    } catch (error) {
      await this.logger.error(`Error approving join request: ${error.message}`);
      return false;
    }
  }
}
