
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
  communityIdOrLink: string
): Promise<boolean> {
  const logger = createLogger(supabase, 'COMMUNITY-START-COMMAND');
  
  try {
    await logger.info(`🏢 Processing community start command for identifier: ${communityIdOrLink}`);
    
    const userId = message.from.id.toString();
    const username = message.from.username;
    
    const communityResult = await findCommunityById(supabase, communityIdOrLink);
    if (!communityResult.success) {
      await logger.error(`❌ Community not found for identifier: ${communityIdOrLink}`);
      
      await sendTelegramMessage(
        botToken,
        message.chat.id,
        `❌ Sorry, the community you're trying to join doesn't exist or there was an error.`
      );
      return true;
    }
    
    const community = communityResult.data;
    
    // Log the found community information
    await logger.info(`✅ Found community: ${community.name} (ID: ${community.id})`);
    
    // Check if community has at least one active subscription plan and one active payment method
    const { hasActivePlan, hasActivePaymentMethod } = await checkCommunityRequirements(supabase, community.id);
    
    if (!hasActivePlan || !hasActivePaymentMethod) {
      await logger.warn(`⚠️ Community ${community.id} does not meet requirements: Active Plan: ${hasActivePlan}, Active Payment Method: ${hasActivePaymentMethod}`);
      
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
      community,
      userId,
      username
    );
  } catch (error) {
    await logger.error(`❌ Error in handleCommunityStartCommand:`, error);
    
    // Try to notify the user about the error
    try {
      await sendTelegramMessage(
        botToken,
        message.chat.id,
        `❌ Sorry, something went wrong while processing your request. Please try again later.`
      );
    } catch (sendError) {
      await logger.error(`Failed to send error message to user:`, sendError);
    }
    
    return false;
  }
}
