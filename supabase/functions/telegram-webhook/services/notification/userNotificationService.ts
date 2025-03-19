
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { createLogger } from '../loggingService.ts';
import { TelegramApiClient } from '../../utils/telegramApiClient.ts';

/**
 * Service for sending notifications to users
 */
export class UserNotificationService {
  private supabase: ReturnType<typeof createClient>;
  private logger: ReturnType<typeof createLogger>;
  
  constructor(supabase: ReturnType<typeof createClient>) {
    this.supabase = supabase;
    this.logger = createLogger(supabase, 'USER-NOTIFICATION-SERVICE');
  }
  
  /**
   * Send thank you message to user after payment
   */
  async sendThankYouMessage(
    userId: string,
    telegramApi: TelegramApiClient,
    inviteLink: string | null,
    communityName?: string
  ): Promise<boolean> {
    try {
      let thankYouMessage = "Thank you for your payment! Your subscription has been activated.";
      
      if (inviteLink) {
        thankYouMessage += `\n\nYou can join the community using this link: ${inviteLink}`;
      } else {
        thankYouMessage += "\n\nYou can now join the community by sending a join request to the group.";
      }
      
      if (communityName) {
        thankYouMessage = thankYouMessage.replace("the community", `"${communityName}"`);
      }
      
      await telegramApi.sendMessage(userId, thankYouMessage);
      
      await this.logger.success('Sent thank you message to user');
      return true;
    } catch (error) {
      await this.logger.error(`Error sending thank you message: ${error.message}`);
      return false;
    }
  }
}
