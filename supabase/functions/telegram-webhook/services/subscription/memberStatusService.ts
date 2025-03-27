
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';
import { createLogger } from '../loggingService.ts';

export class MemberStatusService {
  private supabase: ReturnType<typeof createClient>;
  private logger: ReturnType<typeof createLogger>;
  
  constructor(supabase: ReturnType<typeof createClient>) {
    this.supabase = supabase;
    this.logger = createLogger(supabase, 'MEMBER-STATUS');
  }
  
  /**
   * Mark a member as expired due to subscription end
   */
  async markMemberAsExpired(memberId: string) {
    try {
      // Update the member status to expired
      const { error } = await this.supabase
        .from('telegram_chat_members')
        .update({
          subscription_status: 'expired',
          is_active: false,
          updated_at: new Date().toISOString()
        })
        .eq('id', memberId);
        
      if (error) {
        await this.logger.error(`Failed to mark member ${memberId} as expired: ${error.message}`);
        return false;
      }
      
      await this.logger.info(`Member ${memberId} marked as expired due to subscription end`);
      return true;
    } catch (error) {
      await this.logger.error(`Error marking member as expired: ${error.message}`);
      return false;
    }
  }
  
  /**
   * Mark a member as removed (manually by admin)
   */
  async markMemberAsRemoved(memberId: string) {
    try {
      // Update the member status to removed
      const { error } = await this.supabase
        .from('telegram_chat_members')
        .update({
          subscription_status: 'removed',
          is_active: false,
          updated_at: new Date().toISOString()
        })
        .eq('id', memberId);
        
      if (error) {
        await this.logger.error(`Failed to mark member ${memberId} as removed: ${error.message}`);
        return false;
      }
      
      await this.logger.info(`Member ${memberId} marked as removed (manual removal)`);
      return true;
    } catch (error) {
      await this.logger.error(`Error marking member as removed: ${error.message}`);
      return false;
    }
  }
}
