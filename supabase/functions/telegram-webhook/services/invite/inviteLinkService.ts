
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { createLogger } from '../loggingService.ts';
import { TelegramApiClient } from '../../utils/telegramApiClient.ts';

/**
 * Service for managing invite links
 */
export class InviteLinkService {
  private supabase: ReturnType<typeof createClient>;
  private logger: ReturnType<typeof createLogger>;
  
  constructor(supabase: ReturnType<typeof createClient>) {
    this.supabase = supabase;
    this.logger = createLogger(supabase, 'INVITE-LINK-SERVICE');
  }
  
  /**
   * Get or create an invite link for a community
   */
  async getOrCreateInviteLink(
    communityId: string,
    telegramApi: TelegramApiClient,
    userIdentifier: string,
    paymentId?: string
  ): Promise<string | null> {
    try {
      // Get community information
      const { data: community } = await this.supabase
        .from('communities')
        .select('telegram_invite_link, telegram_chat_id, name')
        .eq('id', communityId)
        .single();
        
      // Return existing invite link if available
      if (community?.telegram_invite_link) {
        await this.logger.info(`Using existing invite link for community ${communityId}`);
        return community.telegram_invite_link;
      }
      
      // Create new invite link if chat ID is available
      if (community?.telegram_chat_id) {
        try {
          const inviteResult = await telegramApi.createChatInviteLink(
            community.telegram_chat_id, 
            `Invite for ${userIdentifier} (${new Date().toISOString()})`
          );
          
          if (inviteResult.ok && inviteResult.result?.invite_link) {
            const inviteLink = inviteResult.result.invite_link;
            
            // Update community with the new invite link
            await this.supabase
              .from('communities')
              .update({ telegram_invite_link: inviteLink })
              .eq('id', communityId);
              
            // Update payment record if payment ID is provided
            if (paymentId) {
              await this.supabase
                .from('project_payments')
                .update({ invite_link: inviteLink })
                .eq('id', paymentId);
            }
            
            await this.logger.info(`Created and stored new invite link: ${inviteLink}`);
            return inviteLink;
          }
        } catch (inviteError) {
          await this.logger.error(`Error creating invite link: ${inviteError.message}`);
        }
      }
      
      return null;
    } catch (error) {
      await this.logger.error(`Error managing invite link: ${error.message}`);
      return null;
    }
  }
}
