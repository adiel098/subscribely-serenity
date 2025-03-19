
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { getLogger, logToDatabase } from '../../services/loggerService.ts';
import { updateCommunityWithPhoto } from './profileVerificationHandler.ts';
import { handleDuplicateCommunity } from './duplicateHandler.ts';

const logger = getLogger('bot-settings-verification');

/**
 * Handle verification based on bot settings method (preferred method)
 */
export async function handleBotSettingsVerification(
  supabase: ReturnType<typeof createClient>,
  botSettings: any,
  chatId: string,
  message: any,
  existingChatCommunity: any
): Promise<boolean> {
  logger.info(`[Verification] Found bot settings: ${botSettings.id} for community: ${botSettings.community_id}`);

  // Check if the chat is already connected to a different community
  if (existingChatCommunity && existingChatCommunity.id !== botSettings.community_id) {
    return await handleDuplicateCommunity(
      supabase, 
      chatId, 
      existingChatCommunity.id, 
      botSettings.community_id
    );
  }

  // Update the bot settings
  const { error: updateError } = await supabase
    .from('telegram_bot_settings')
    .update({
      chat_id: chatId,
      verified_at: new Date().toISOString()
    })
    .eq('id', botSettings.id);

  if (updateError) {
    logger.error(`[Verification] Error updating bot settings: ${updateError.message}`, updateError);
    await logToDatabase(supabase, 'VERIFICATION', 'ERROR', 'Error updating bot settings', 
      { error: updateError, bot_settings_id: botSettings.id });
    return false;
  }

  // Update the community with the chat ID
  const { error: communityError } = await supabase
    .from('communities')
    .update({ telegram_chat_id: chatId })
    .eq('id', botSettings.community_id);

  if (communityError) {
    logger.error(`[Verification] Error updating community: ${communityError.message}`, communityError);
    await logToDatabase(supabase, 'VERIFICATION', 'ERROR', 'Error updating community', 
      { error: communityError, community_id: botSettings.community_id });
    return false;
  }

  // Update the community with a photo and send confirmation messages
  await updateCommunityWithPhoto(supabase, botSettings.community_id, chatId, message.message_id);

  await logToDatabase(supabase, 'VERIFICATION', 'INFO', 'Verification completed successfully (bot settings method)', {
    bot_settings_id: botSettings.id,
    community_id: botSettings.community_id,
    chat_id: chatId
  });
  
  return true;
}
