
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { getLogger, logToDatabase } from '../../services/loggerService.ts';
import { fetchAndUpdateCommunityPhoto } from '../utils/photoHandler.ts';
import { handleDuplicateChatId } from './duplicateHandler.ts';

const logger = getLogger('profile-verification');

/**
 * Handle verification based on profile method (legacy method)
 */
export async function handleProfileVerification(
  supabase: ReturnType<typeof createClient>,
  profile: any,
  chatId: string,
  verificationCode: string,
  message: any,
  existingChatCommunity: any
): Promise<boolean> {
  logger.info(`[Verification] Found matching profile: ${profile.id}`);
  
  // Check if this chat is already connected to another user's community
  if (existingChatCommunity) {
    // If the chat belongs to the same user, that's fine
    if (existingChatCommunity.owner_id === profile.id) {
      logger.info(`[Verification] Chat ID ${chatId} already owned by this user, updating settings`);
      
      // Update the existing community's bot settings
      const { error: settingsError } = await supabase
        .from('telegram_bot_settings')
        .upsert({
          community_id: existingChatCommunity.id,
          chat_id: chatId,
          verification_code: verificationCode,
          verified_at: new Date().toISOString()
        });
        
      if (settingsError) {
        logger.error(`Error updating bot settings: ${settingsError.message}`, settingsError);
      }
      
      return true;
    } else {
      // If the chat belongs to another user, it's a conflict
      return await handleDuplicateChatId(
        supabase, 
        chatId, 
        existingChatCommunity.owner_id, 
        profile.id,
        verificationCode
      );
    }
  }
  
  // Create a new community for the user
  return await createCommunityForProfile(supabase, profile.id, message, chatId, verificationCode);
}

/**
 * Create a new community for a verified profile
 */
async function createCommunityForProfile(
  supabase: ReturnType<typeof createClient>,
  profileId: string,
  message: any,
  chatId: string,
  verificationCode: string
): Promise<boolean> {
  // Create a new community
  const { data: community, error: communityError } = await supabase
    .from('communities')
    .insert({
      name: message.chat.title || 'Telegram Community',
      owner_id: profileId,
      telegram_chat_id: chatId
    })
    .select()
    .single();

  if (communityError) {
    logger.error(`[Verification] Error creating community: ${communityError.message}`, communityError);
    await logToDatabase(supabase, 'VERIFICATION', 'ERROR', 'Error creating community', 
      { error: communityError, profile_id: profileId });
    return false;
  }

  logger.info(`[Verification] Created new community: ${community.id}`);

  // Create bot settings for the new community
  const { error: botSettingsError } = await supabase
    .from('telegram_bot_settings')
    .insert({
      community_id: community.id,
      chat_id: chatId,
      verification_code: verificationCode,
      verified_at: new Date().toISOString()
    });

  if (botSettingsError) {
    logger.error(`[Verification] Error creating bot settings: ${botSettingsError.message}`, botSettingsError);
    await logToDatabase(supabase, 'VERIFICATION', 'ERROR', 'Error creating bot settings', 
      { error: botSettingsError, community_id: community.id });
  } else {
    logger.info(`[Verification] Created bot settings for community: ${community.id}`);
  }

  // Update the community with a photo
  await updateCommunityWithPhoto(supabase, community.id, chatId);

  await logToDatabase(supabase, 'VERIFICATION', 'INFO', 'Verification completed successfully (profile method)', {
    profile_id: profileId,
    community_id: community.id,
    chat_id: chatId
  });
  
  return true;
}

/**
 * Try to update the community with a photo and send confirmation messages
 */
export async function updateCommunityWithPhoto(
  supabase: ReturnType<typeof createClient>,
  communityId: string,
  chatId: string,
  messageId?: number
): Promise<void> {
  try {
    const { data: settings } = await supabase
      .from('telegram_global_settings')
      .select('bot_token')
      .single();

    if (settings?.bot_token) {
      // Fetch and update community photo
      const photoUrl = await fetchAndUpdateCommunityPhoto(
        supabase,
        settings.bot_token,
        communityId,
        chatId
      );
      
      logger.info(`[Verification] Updated community photo: ${photoUrl || 'No photo available'}`);

      if (messageId) {
        // Try to delete the verification message
        try {
          await fetch(`https://api.telegram.org/bot${settings.bot_token}/deleteMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              chat_id: chatId,
              message_id: messageId
            }),
          });
          
          logger.info(`[Verification] Deleted verification message`);
        } catch (deleteError) {
          logger.warn(`[Verification] Could not delete verification message: ${deleteError.message}`);
        }
      }
      
      // Send success message
      try {
        await fetch(`https://api.telegram.org/bot${settings.bot_token}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: chatId,
            text: "✅ Successfully connected to Membify platform!"
          }),
        });
        
        logger.info(`[Verification] Sent success message`);
      } catch (sendError) {
        logger.warn(`[Verification] Could not send success message: ${sendError.message}`);
      }
    }
  } catch (apiError) {
    logger.error(`[Verification] Error with Telegram API: ${apiError.message}`, apiError);
    await logToDatabase(supabase, 'VERIFICATION', 'ERROR', 'Error with Telegram API', { error: apiError });
  }
}
