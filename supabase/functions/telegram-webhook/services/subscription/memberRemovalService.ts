
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.7';
import { createLogger } from '../../../_shared/logger.ts';

export class MemberRemovalService {
  private supabase: ReturnType<typeof createClient>;
  private logger;

  constructor(supabase: ReturnType<typeof createClient>) {
    this.supabase = supabase;
    this.logger = createLogger(supabase, 'MEMBER-REMOVAL-SERVICE');
  }

  /**
   * Remove a member manually (admin-initiated)
   */
  async removeManually(
    chatId: string,
    telegramUserId: string,
    memberId: string,
    telegramApi: any
  ): Promise<{
    success: boolean;
    telegramSuccess: boolean;
    error?: string;
  }> {
    try {
      await this.logger.info(`Manual removal initiated for user ${telegramUserId} from chat ${chatId}`);
      
      // 1. First try to kick the member from Telegram
      const kickResult = await telegramApi.kickChatMember(chatId, telegramUserId);
      
      // 2. Get community ID for updating records
      const { data: community, error: communityError } = await this.supabase
        .from('communities')
        .select('id')
        .eq('telegram_chat_id', chatId)
        .single();
        
      if (communityError) {
        await this.logger.error(`Could not find community: ${communityError.message}`);
        return {
          success: false,
          telegramSuccess: kickResult.success,
          error: `Database error: ${communityError.message}`
        };
      }
      
      // 3. Invalidate any invite links for this user
      await this.logger.info(`Invalidating invite links for user ${telegramUserId} in community ${community.id}`);
      
      const { error: inviteError } = await this.supabase
        .from('subscription_payments')
        .update({ invite_link: null })
        .eq('telegram_user_id', telegramUserId)
        .eq('community_id', community.id);
        
      if (inviteError) {
        await this.logger.warn(`Error invalidating invite links: ${inviteError.message}`);
        // Continue despite error since link invalidation is secondary to the removal
      }
      
      // 4. Update the member status in the database
      await this.logger.info(`Updating subscriber record ${memberId} to status "removed"`);
      
      const { error: updateError } = await this.supabase
        .from('community_subscribers')
        .update({
          is_active: false,
          subscription_status: 'removed'
        })
        .eq('id', memberId);
        
      if (updateError) {
        await this.logger.error(`Error updating subscriber: ${updateError.message}`);
        return {
          success: false,
          telegramSuccess: kickResult.success,
          error: `Database error: ${updateError.message}`
        };
      }
      
      // 5. Log the activity
      await this.supabase
        .from('subscription_activity_logs')
        .insert({
          telegram_user_id: telegramUserId,
          community_id: community.id,
          activity_type: 'member_removed',
          details: 'Member manually removed from community by admin',
          status: 'removed'
        })
        .then(({ error }) => {
          if (error) this.logger.warn(`Error logging activity: ${error.message}`);
        });
      
      // Return success with info about the Telegram operation
      return {
        success: true,
        telegramSuccess: kickResult.success,
        error: kickResult.success ? undefined : kickResult.error
      };
    } catch (error) {
      await this.logger.error(`Error in removeManually: ${error.message}`);
      return {
        success: false,
        telegramSuccess: false,
        error: error.message
      };
    }
  }
}
