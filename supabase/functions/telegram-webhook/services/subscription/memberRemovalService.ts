
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
    botToken: string
  ): Promise<{
    success: boolean;
    telegramSuccess: boolean;
    error?: string;
  }> {
    try {
      await this.logger.info(`Manual removal initiated for user ${telegramUserId} from chat ${chatId}`);
      
      // 1. First try to kick the member from Telegram
      const kickResult = await this.kickMember(chatId, telegramUserId, botToken, false, 'removed');
      
      // 2. Get community ID for updating records
      // We now assume we receive the telegram_chat_id directly, so we need to look up the community ID
      const { data: community, error: communityError } = await this.supabase
        .from('communities')
        .select('id')
        .eq('telegram_chat_id', chatId)
        .single();
        
      if (communityError) {
        await this.logger.error(`Could not find community: ${communityError.message}`);
        return {
          success: false,
          telegramSuccess: kickResult.telegramSuccess,
          error: `Database error: ${communityError.message}`
        };
      }
      
      const communityId = community.id;
      
      // 3. Invalidate any invite links for this user
      await this.logger.info(`Invalidating invite links for user ${telegramUserId} in community ${communityId}`);
      
      const { error: inviteError } = await this.supabase
        .from('project_payments')
        .update({ invite_link: null })
        .eq('telegram_user_id', telegramUserId)
        .eq('project_id', communityId);
        
      if (inviteError) {
        await this.logger.warn(`Error invalidating invite links: ${inviteError.message}`);
        // Continue despite error since link invalidation is secondary to the removal
      }
      
      // 4. Find the subscriber by telegram_user_id and community_id
      const { data: subscribers, error: subscribersError } = await this.supabase
        .from('community_subscribers')
        .select('id')
        .eq('telegram_user_id', telegramUserId)
        .eq('community_id', communityId);
        
      if (subscribersError || !subscribers || subscribers.length === 0) {
        await this.logger.error(`Error finding subscriber: ${subscribersError?.message || 'No subscriber found'}`);
        return {
          success: false,
          telegramSuccess: kickResult.telegramSuccess,
          error: `Database error: ${subscribersError?.message || 'Subscriber not found'}`
        };
      }
      
      // 5. Update the subscriber status in the database
      await this.logger.info(`Updating subscriber record to status "removed"`);
      
      for (const subscriber of subscribers) {
        const { error: updateError } = await this.supabase
          .from('community_subscribers')
          .update({
            is_active: false,
            subscription_status: 'removed'
          })
          .eq('id', subscriber.id);
          
        if (updateError) {
          await this.logger.error(`Error updating subscriber ${subscriber.id}: ${updateError.message}`);
        }
      }
      
      // 6. Log the activity
      await this.supabase
        .from('subscription_activity_logs')
        .insert({
          telegram_user_id: telegramUserId,
          community_id: communityId,
          activity_type: 'member_removed',
          details: 'Member manually removed from community by admin',
          status: 'removed'
        });
      
      // Return success with info about the Telegram operation
      return {
        success: true,
        telegramSuccess: kickResult.telegramSuccess,
        error: kickResult.error
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

  /**
   * Remove an expired member (system-initiated)
   * This differs from manual removal in that:
   * 1. It sets status to 'expired' instead of 'removed'
   * 2. It sends an expiry notification message
   * 3. It unblocks the user so they can rejoin in the future
   */
  async removeExpired(
    communityId: string,
    telegramUserId: string,
    memberId: string,
    botToken: string
  ): Promise<{
    success: boolean;
    telegramSuccess: boolean;
    messageSuccess: boolean;
    error?: string;
  }> {
    try {
      await this.logger.info(`Expired member removal for user ${telegramUserId} from community ${communityId}`);
      
      // 1. Get the chat ID for this community
      const { data: community, error: communityError } = await this.supabase
        .from('communities')
        .select('telegram_chat_id, name')
        .eq('id', communityId)
        .single();
        
      if (communityError || !community?.telegram_chat_id) {
        await this.logger.error(`Could not find community: ${communityError?.message}`);
        return {
          success: false,
          telegramSuccess: false,
          messageSuccess: false,
          error: `Database error: ${communityError?.message || 'Community not found'}`
        };
      }
      
      const chatId = community.telegram_chat_id;
      
      // 2. Get the bot settings for this community
      const { data: botSettings, error: botSettingsError } = await this.supabase
        .from('telegram_bot_settings')
        .select('expired_subscription_message, auto_remove_expired')
        .eq('community_id', communityId)
        .single();
        
      if (botSettingsError) {
        await this.logger.error(`Could not fetch bot settings: ${botSettingsError.message}`);
        return {
          success: false,
          telegramSuccess: false,
          messageSuccess: false,
          error: `Database error: ${botSettingsError.message}`
        };
      }
      
      let telegramSuccess = false;
      
      // 3. If auto-remove is enabled, kick the member but allow rejoining
      if (botSettings.auto_remove_expired) {
        await this.logger.info(`Auto-remove is enabled, kicking member ${telegramUserId} from ${chatId}`);
        
        const kickResult = await this.kickMember(chatId, telegramUserId, botToken, true, 'expired');
        telegramSuccess = kickResult.telegramSuccess;
        
        if (!kickResult.telegramSuccess) {
          await this.logger.warn(`Failed to remove member from Telegram: ${kickResult.error}`);
        }
      } else {
        await this.logger.info(`Auto-remove is disabled, not kicking member ${telegramUserId}`);
        telegramSuccess = true; // Consider this successful since we're not attempting to kick
      }
      
      // 4. Invalidate any invite links for this user
      await this.logger.info(`Invalidating invite links for user ${telegramUserId} in community ${communityId}`);
      
      const { error: inviteError } = await this.supabase
        .from('project_payments')
        .update({ invite_link: null })
        .eq('telegram_user_id', telegramUserId)
        .eq('project_id', communityId);
        
      if (inviteError) {
        await this.logger.warn(`Error invalidating invite links: ${inviteError.message}`);
      }
      
      // 5. Update the subscriber status in the database
      await this.logger.info(`Updating subscriber record ${memberId} to status "expired"`);
      
      const { error: updateError } = await this.supabase
        .from('community_subscribers')
        .update({
          is_active: false,
          subscription_status: 'expired'
        })
        .eq('id', memberId);
        
      if (updateError) {
        await this.logger.error(`Error updating subscriber: ${updateError.message}`);
        return {
          success: false,
          telegramSuccess,
          messageSuccess: false,
          error: `Database error: ${updateError.message}`
        };
      }
      
      // 6. Send expiry notification message if available
      let messageSuccess = false;
      
      if (botSettings.expired_subscription_message) {
        try {
          await this.logger.info(`Sending expiry notification to user ${telegramUserId}`);
          
          const message = botSettings.expired_subscription_message
            .replace(/\[community_name\]/g, community.name || 'our community');
            
          const messageResult = await this.sendTelegramMessage(
            telegramUserId,
            message,
            botToken
          );
          
          messageSuccess = messageResult.success;
          
          if (!messageResult.success) {
            await this.logger.warn(`Failed to send expiry notification: ${messageResult.error}`);
          } else {
            await this.logger.info(`Successfully sent expiry notification to user ${telegramUserId}`);
            
            // Log the notification
            await this.supabase
              .from('subscription_notifications')
              .insert({
                member_id: memberId,
                community_id: communityId,
                notification_type: 'expiry',
                status: 'sent'
              });
          }
        } catch (msgError) {
          await this.logger.warn(`Error sending expiry notification: ${msgError.message}`);
        }
      }
      
      // 7. Log the expiry activity
      await this.supabase
        .from('subscription_activity_logs')
        .insert({
          telegram_user_id: telegramUserId,
          community_id: communityId,
          activity_type: 'subscription_expired',
          details: 'Subscription expired and member removed',
          status: 'expired'
        });
      
      return {
        success: true,
        telegramSuccess,
        messageSuccess
      };
    } catch (error) {
      await this.logger.error(`Error in removeExpired: ${error.message}`);
      return {
        success: false,
        telegramSuccess: false,
        messageSuccess: false,
        error: error.message
      };
    }
  }

  /**
   * Generic method to kick a member from a Telegram chat
   * For expired members, we unban them right after kicking so they can rejoin in the future
   */
  private async kickMember(
    chatId: string,
    telegramUserId: string,
    botToken: string,
    unbanAfterKick: boolean,
    reason: 'removed' | 'expired'
  ): Promise<{
    telegramSuccess: boolean;
    error?: string;
  }> {
    try {
      // 1. First try to kick the member using banChatMember
      const kickEndpoint = `https://api.telegram.org/bot${botToken}/banChatMember`;
      const kickResponse = await fetch(kickEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          user_id: telegramUserId,
          until_date: Math.floor(Date.now() / 1000) + 40 // 40 seconds (minimum time)
        })
      });
      
      const kickResult = await kickResponse.json();
      
      if (!kickResult.ok) {
        return {
          telegramSuccess: false,
          error: kickResult.description
        };
      }
      
      // 2. If requested, unban the member after a short delay
      if (unbanAfterKick) {
        // Wait 2 seconds before unbanning
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        const unbanEndpoint = `https://api.telegram.org/bot${botToken}/unbanChatMember`;
        const unbanResponse = await fetch(unbanEndpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: chatId,
            user_id: telegramUserId,
            only_if_banned: true
          })
        });
        
        const unbanResult = await unbanResponse.json();
        
        if (!unbanResult.ok) {
          await this.logger.warn(`Failed to unban user: ${unbanResult.description}`);
          // Don't fail the whole operation if unban fails
        }
      }
      
      return { telegramSuccess: true };
    } catch (error) {
      await this.logger.error(`Exception in kickMember: ${error.message}`);
      return {
        telegramSuccess: false,
        error: error.message
      };
    }
  }

  /**
   * Send a message to a Telegram user
   */
  private async sendTelegramMessage(
    telegramUserId: string,
    message: string,
    botToken: string
  ): Promise<{
    success: boolean;
    error?: string;
  }> {
    try {
      const endpoint = `https://api.telegram.org/bot${botToken}/sendMessage`;
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: telegramUserId,
          text: message,
          parse_mode: 'HTML'
        })
      });
      
      const result = await response.json();
      
      if (!result.ok) {
        return {
          success: false,
          error: result.description
        };
      }
      
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }
}

// Helper function to handle member removal
export async function handleMemberRemoval(
  supabase: ReturnType<typeof createClient>,
  chatId: string,
  telegramUserId: string,
  botToken: string,
  communityId?: string,
  reason: 'removed' | 'expired' = 'removed'
): Promise<Response> {
  const service = new MemberRemovalService(supabase);
  const logger = createLogger(supabase, 'MEMBER-REMOVAL');
  
  try {
    await logger.info(`Processing member removal request for user ${telegramUserId} from chat ${chatId}, reason: ${reason}`);
    
    if (reason === 'removed') {
      // Handle manual removal (admin initiated)
      const result = await service.removeManually(chatId, telegramUserId, botToken);
      
      return new Response(
        JSON.stringify({
          success: result.success,
          telegram_success: result.telegramSuccess,
          error: result.error
        }),
        { 
          headers: { 'Content-Type': 'application/json' },
          status: result.success ? 200 : 500
        }
      );
    } else if (reason === 'expired') {
      // Handle expiry removal (system initiated)
      if (!communityId) {
        return new Response(
          JSON.stringify({
            success: false,
            error: 'Community ID is required for expiry removals'
          }),
          { 
            headers: { 'Content-Type': 'application/json' },
            status: 400
          }
        );
      }
      
      // Get the member ID
      const { data: member, error: memberError } = await supabase
        .from('community_subscribers')
        .select('id')
        .eq('community_id', communityId)
        .eq('telegram_user_id', telegramUserId)
        .single();
        
      if (memberError || !member) {
        await logger.error(`Could not find member: ${memberError?.message || 'Not found'}`);
        return new Response(
          JSON.stringify({
            success: false,
            error: `Could not find member: ${memberError?.message || 'Not found'}`
          }),
          { 
            headers: { 'Content-Type': 'application/json' },
            status: 404
          }
        );
      }
      
      const result = await service.removeExpired(communityId, telegramUserId, member.id, botToken);
      
      return new Response(
        JSON.stringify({
          success: result.success,
          telegram_success: result.telegramSuccess,
          message_success: result.messageSuccess,
          error: result.error
        }),
        { 
          headers: { 'Content-Type': 'application/json' },
          status: result.success ? 200 : 500
        }
      );
    } else {
      return new Response(
        JSON.stringify({
          success: false,
          error: `Invalid removal reason: ${reason}`
        }),
        { 
          headers: { 'Content-Type': 'application/json' },
          status: 400
        }
      );
    }
  } catch (error) {
    await logger.error(`Error in handleMemberRemoval: ${error.message}`);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message
      }),
      { 
        headers: { 'Content-Type': 'application/json' },
        status: 500
      }
    );
  }
}
