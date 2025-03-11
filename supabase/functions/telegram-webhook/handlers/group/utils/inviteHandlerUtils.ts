
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { createGroupInviteLink } from '../../../handlers/inviteLinkHandler.ts';
import { sendTelegramMessage } from '../../../utils/telegramMessenger.ts';
import { createLogger } from '../../../services/loggingService.ts';

/**
 * Handle join request for a group
 */
export async function handleGroupJoinRequest(
  supabase: ReturnType<typeof createClient>,
  message: any,
  botToken: string,
  group: any,
  userId: string,
  username: string | undefined = undefined
): Promise<boolean> {
  const logger = createLogger(supabase, 'GROUP-INVITE-HANDLER');
  
  try {
    await logger.info(`👋 Processing join request for user ${userId} to group ${group.name}`);
    
    // Generate invite link
    try {
      const inviteLinkResult = await createGroupInviteLink(supabase, group.id, botToken, {
        name: `User ${userId} - ${new Date().toISOString().split('T')[0]}`,
        expireHours: 24
      });
      
      if (inviteLinkResult?.invite_link) {
        await logger.success(`✅ Created invite link for user ${userId} to group ${group.name}`);
        
        await sendTelegramMessage(
          botToken,
          message.chat.id,
          `✅ Thanks for your interest in ${group.name}!\n\n` +
          `Here's your invite link to join the group:\n${inviteLinkResult.invite_link}\n\n` +
          `This link will expire in 24 hours and is for your use only. Please don't share it with others.`
        );
        
        return true;
      }
    } catch (linkError) {
      await logger.error(`❌ Error creating group invite link:`, linkError);
    }
    
    // Fallback message if invite link creation fails
    await sendTelegramMessage(
      botToken,
      message.chat.id,
      `✅ Thanks for your interest in ${group.name}!\n\n` +
      `However, there was an issue creating your invite link. Please contact the group owner for assistance.`
    );
    
    return true;
  } catch (error) {
    await logger.error(`❌ Error in handleGroupJoinRequest:`, error);
    return false;
  }
}
