
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { sendTelegramMessage } from '../../utils/telegramMessenger.ts';
import { findGroupById, findGroupCommunities, checkGroupRequirements } from './utils/groupDatabaseUtils.ts';
import { handleJoinRequest } from './utils/inviteHandlerUtils.ts';
import { createLogger } from '../../services/loggingService.ts';

/**
 * Handle the start command for group invites
 */
export async function handleGroupStartCommand(
  supabase: ReturnType<typeof createClient>, 
  message: any, 
  botToken: string,
  groupId: string
): Promise<boolean> {
  const logger = createLogger(supabase, 'GROUP-START-COMMAND');
  
  try {
    await logger.info(`👥👥👥 Processing GROUP start command for group ID: ${groupId}`);
    
    const userId = message.from.id.toString();
    const username = message.from.username;
    
    const group = await findGroupById(supabase, groupId);
    if (!group.success) {
      await logger.error(`❌ Group not found for ID: ${groupId}`);
      
      await sendTelegramMessage(
        botToken,
        message.chat.id,
        `❌ Sorry, the group you're trying to join doesn't exist or there was an error.`
      );
      return true;
    }

    const { hasActivePlan, hasActivePaymentMethod } = await checkGroupRequirements(supabase, groupId);
    
    if (!hasActivePlan || !hasActivePaymentMethod) {
      await logger.warn(`⚠️ Group ${groupId} does not meet requirements: Active Plan: ${hasActivePlan}, Active Payment Method: ${hasActivePaymentMethod}`);
      
      await sendTelegramMessage(
        botToken,
        message.chat.id,
        `⚠️ This group is not fully configured yet. Please contact the administrator.`
      );
      return true;
    }

    const groupCommunities = await findGroupCommunities(supabase, groupId);
    if (!groupCommunities.success) return false;

    if (groupCommunities.communityIds.length === 0) {
      await logger.warn(`⚠️ Group ${groupId} has no associated communities`);
      
      await sendTelegramMessage(
        botToken,
        message.chat.id,
        `❌ Sorry, this group is not properly configured. Please contact the administrator.`
      );
      return true;
    }

    return await handleJoinRequest(supabase, message, botToken, group.data, userId);
  } catch (error) {
    await logger.error(`❌ Error in handleGroupStartCommand:`, error);
    return false;
  }
}
