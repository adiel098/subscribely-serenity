
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';
import { createLogger } from '../loggingService.ts';
import { TelegramApiClient } from '../../utils/telegramApiClient.ts';
import { MemberStatusService } from './memberStatusService.ts';

export class MemberRemovalService {
  private supabase: ReturnType<typeof createClient>;
  private logger: ReturnType<typeof createLogger>;
  private statusService: MemberStatusService;
  
  constructor(supabase: ReturnType<typeof createClient>) {
    this.supabase = supabase;
    this.logger = createLogger(supabase, 'MEMBER-REMOVAL');
    this.statusService = new MemberStatusService(supabase);
  }
  
  /**
   * Remove a member from a Telegram chat due to expired subscription
   */
  async removeExpiredMember(
    chatId: string, 
    telegramUserId: string, 
    memberId: string,
    telegramApi: TelegramApiClient
  ) {
    try {
      // Attempt to kick member from Telegram chat
      const kickResult = await telegramApi.kickChatMember(chatId, telegramUserId);
      
      if (!kickResult.success) {
        await this.logger.warn(
          `Failed to kick expired member ${telegramUserId} from chat ${chatId}: ${kickResult.error}`
        );
      }
      
      // Always update the database status to expired, regardless of Telegram API result
      await this.statusService.markMemberAsExpired(memberId);
      
      await this.logger.info(
        `Expired member ${telegramUserId} processed (Telegram kick: ${kickResult.success ? 'success' : 'failed'})`
      );
      
      return {
        success: true,
        telegramSuccess: kickResult.success,
        error: kickResult.error
      };
    } catch (error) {
      await this.logger.error(`Error processing expired member removal: ${error.message}`);
      return {
        success: false,
        telegramSuccess: false,
        error: error.message
      };
    }
  }
  
  /**
   * Remove a member manually (by admin action)
   */
  async removeManually(
    chatId: string, 
    telegramUserId: string, 
    memberId: string,
    telegramApi: TelegramApiClient
  ) {
    try {
      // Attempt to kick member from Telegram chat
      const kickResult = await telegramApi.kickChatMember(chatId, telegramUserId);
      
      if (!kickResult.success) {
        await this.logger.warn(
          `Failed to manually kick member ${telegramUserId} from chat ${chatId}: ${kickResult.error}`
        );
      }
      
      // Always update the database status to removed, regardless of Telegram API result
      await this.statusService.markMemberAsRemoved(memberId);
      
      await this.logger.info(
        `Member ${telegramUserId} manually removed (Telegram kick: ${kickResult.success ? 'success' : 'failed'})`
      );
      
      return {
        success: true,
        telegramSuccess: kickResult.success,
        error: kickResult.error
      };
    } catch (error) {
      await this.logger.error(`Error processing manual member removal: ${error.message}`);
      return {
        success: false,
        telegramSuccess: false,
        error: error.message
      };
    }
  }
}
