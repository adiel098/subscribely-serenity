
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { sendTelegramMessage } from '../../utils/telegramMessenger.ts';
import { findGroupById, checkGroupRequirements } from './utils/groupDatabaseUtils.ts';
import { handleGroupJoinRequest } from './utils/inviteHandlerUtils.ts';
import { createLogger } from '../../services/loggingService.ts';

/**
 * Handle start command for group invites
 */
export async function handleGroupStartCommand(
  supabase: ReturnType<typeof createClient>, 
  message: any, 
  botToken: string,
  groupId: string
): Promise<boolean> {
  const logger = createLogger(supabase, 'GROUP-START-COMMAND');
  
  try {
    await logger.info(`🏢 Processing group start command for group ID: ${groupId}`);
    
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
    
    // Check if group has at least one active subscription plan and one active payment method
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
    
    // Now handle the join request
    return await handleGroupJoinRequest(
      supabase,
      message,
      botToken,
      group.data,
      userId,
      username
    );
  } catch (error) {
    await logger.error(`❌ Error in handleGroupStartCommand:`, error);
    return false;
  }
}
