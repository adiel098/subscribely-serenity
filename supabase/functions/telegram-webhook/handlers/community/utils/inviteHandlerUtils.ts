
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { createInviteLink } from '../../../handlers/inviteLinkHandler.ts';
import { sendTelegramMessage } from '../../../utils/telegramMessenger.ts';
import { updateCommunityMemberCount } from '../../../utils/communityCountUtils.ts';
import { createOrUpdateMember } from '../../../utils/dbLogger.ts';
import { createLogger } from '../../../services/loggingService.ts';

/**
 * Handle join request for any user regardless of subscription status
 */
export async function handleCommunityJoinRequest(
  supabase: ReturnType<typeof createClient>,
  message: any,
  botToken: string,
  community: any,
  userId: string,
  username: string | undefined = undefined
): Promise<boolean> {
  const logger = createLogger(supabase, 'COMMUNITY-INVITE-HANDLER');
  
  try {
    await logger.info(`👋 Processing join request for user ${userId} to community ${community.name}`);
    
    // Create/update member record if subscription info is available
    if (username) {
      const memberData = {
        telegram_user_id: userId,
        telegram_username: username,
        community_id: community.id,
        is_active: true,
      };
      
      const { success: memberSuccess } = await createOrUpdateMember(supabase, memberData);
      
      if (!memberSuccess) {
        await logger.error(`❌ Failed to create/update member record for user ${userId}`);
      }
    }
    
    // Generate invite link
    try {
      const inviteLinkResult = await createInviteLink(supabase, community.id, botToken, {
        name: `User ${userId} - ${new Date().toISOString().split('T')[0]}`,
        expireHours: 24
      });
      
      if (inviteLinkResult?.invite_link) {
        await logger.success(`✅ Created invite link for user ${userId} to community ${community.name}`);
        
        await sendTelegramMessage(
          botToken,
          message.chat.id,
          `✅ Thanks for your interest in ${community.name}!\n\n` +
          `Here's your invite link to join the community:\n${inviteLinkResult.invite_link}\n\n` +
          `This link will expire in 24 hours and is for your use only. Please don't share it with others.`
        );
        
        await updateCommunityMemberCount(supabase, community.id);
        return true;
      }
    } catch (linkError) {
      await logger.error(`❌ Error creating community invite link:`, linkError);
    }
    
    // Fallback message if invite link creation fails
    await sendTelegramMessage(
      botToken,
      message.chat.id,
      `✅ Thanks for your interest in ${community.name}!\n\n` +
      `However, there was an issue creating your invite link. Please contact the community owner for assistance.`
    );
    
    return true;
  } catch (error) {
    await logger.error(`❌ Error in handleCommunityJoinRequest:`, error);
    return false;
  }
}
