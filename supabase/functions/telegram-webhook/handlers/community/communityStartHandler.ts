
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { sendTelegramMessage } from '../../utils/telegramMessenger.ts';
import { findCommunityById, checkCommunityRequirements } from './utils/communityDatabaseUtils.ts';
import { handleCommunityJoinRequest } from './utils/inviteHandlerUtils.ts';
import { createLogger } from '../../services/loggingService.ts';

/**
 * Handle start command for community invites
 */
export async function handleCommunityStartCommand(
  supabase: ReturnType<typeof createClient>, 
  message: any, 
  botToken: string,
  communityId: string
): Promise<boolean> {
  const logger = createLogger(supabase, 'COMMUNITY-START-COMMAND');
  
  try {
    await logger.info(`🏢 Processing community start command for community ID: ${communityId}`);
    
    const userId = message.from.id.toString();
    const username = message.from.username;
    
    const community = await findCommunityById(supabase, communityId);
    if (!community.success) {
      await logger.error(`❌ Community not found for ID: ${communityId}`);
      
      await sendTelegramMessage(
        botToken,
        message.chat.id,
        `❌ Sorry, the community you're trying to join doesn't exist or there was an error.`
      );
      return true;
    }
    
    // Check if community has at least one active subscription plan and one active payment method
    const { hasActivePlan, hasActivePaymentMethod } = await checkCommunityRequirements(supabase, communityId);
    
    if (!hasActivePlan || !hasActivePaymentMethod) {
      await logger.warn(`⚠️ Community ${communityId} does not meet requirements: Active Plan: ${hasActivePlan}, Active Payment Method: ${hasActivePaymentMethod}`);
      
      await sendTelegramMessage(
        botToken,
        message.chat.id,
        `⚠️ This community is not fully configured yet. Please contact the administrator.`
      );
      return true;
    }
    
    // Now handle the join request
    return await handleCommunityJoinRequest(
      supabase,
      message,
      botToken,
      community.data,
      userId,
      username
    );
  } catch (error) {
    await logger.error(`❌ Error in handleCommunityStartCommand:`, error);
    return false;
  }
}
