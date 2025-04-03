import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { fetchAndUpdateCommunityPhoto } from '../../handlers/utils/photoHandler.ts';
import { createLogger } from '../../services/loggingService.ts';
import { createBotSettings } from '../../services/botSettings/createBotSettingsService.ts';

interface TelegramMessage {
  chat: {
    id: number;
    title?: string;
    description?: string;
    type: string;
  };
  text?: string;
  from?: {
    id: number;
    username?: string;
  };
  message_id?: number;
}

/**
 * Handles verification of channels/groups
 */
export async function handleVerification(
  supabase: ReturnType<typeof createClient>,
  message: TelegramMessage,
  botToken: string
): Promise<boolean> {
  const logger = createLogger(supabase, 'VERIFICATION-HANDLER');
  
  try {
    await logger.info(`🔑 Processing verification message:`, message);
    
    // Extract the verification code (format: MBF_XXXX)
    const code = message.text?.trim();
    const chatId = message.chat.id;
    
    if (!code?.startsWith('MBF_')) {
      await logger.info('Not a verification message');
      return false;
    }
    
    await logger.info(`Raw message: "${message.text}"`);
    await logger.info(`Trimmed code: "${code}"`);
    await logger.info(`Chat ID: ${chatId}`);
    
    // Check if chat is already verified
    const { data: existingCommunity, error: existingError } = await supabase
      .from('communities')
      .select('id, owner_id')
      .eq('telegram_chat_id', chatId)
      .maybeSingle();
      
    if (existingError) {
      await logger.error('Error checking existing community:', existingError);
      return false;
    }
    
    if (existingCommunity) {
      await logger.info(`Chat ${chatId} is already verified and linked to community ${existingCommunity.id}`);
      return false;
    }
    
    // Look up the owner by verification code
    await logger.info(`🔍 Looking for owner with verification code "${code}"`);
    
    const { data: owner, error: ownerError } = await supabase
      .from('profiles')
      .select('id, current_telegram_code')
      .eq('current_telegram_code', code)
      .maybeSingle();
      
    if (ownerError) {
      await logger.error('Error finding owner:', ownerError);
      return false;
    }
    
    if (!owner) {
      await logger.error(`❌ Verification code not found: ${code}`);
      return false;
    }
    
    await logger.info(`Found owner with ID: ${owner.id}`);
    
    // Create new community owned by this user
    const { data: newCommunity, error: communityError } = await supabase
      .from('communities')
      .insert({
        name: message.chat.title || 'Telegram Community',
        owner_id: owner.id,
        telegram_chat_id: chatId,
        description: message.chat.description || null,
        telegram_photo_url: null  // Will be updated by fetchAndUpdateCommunityPhoto
      })
      .select()
      .single();
      
    if (communityError) {
      await logger.error(`❌ Failed to create community:`, communityError);
      return false;
    }

    // Create default telegram bot settings
    const { success: settingsSuccess, error: settingsError } = await createBotSettings(
      supabase,
      logger,
      {
        communityId: newCommunity.id,
        chatId,
        communityName: message.chat.title || 'Telegram Community',
        description: message.chat.description
      }
    );

    if (!settingsSuccess) {
      await logger.error(`❌ Failed to create bot settings:`, settingsError);
      // Continue anyway as the community was created
      await logger.warn('Community created but bot settings failed - manual setup may be required');
    }

    // Fetch and update the community photo
    const photoUrl = await fetchAndUpdateCommunityPhoto(
      supabase,
      botToken,
      newCommunity.id,
      chatId
    );
    
    if (photoUrl) {
      await logger.info(`📸 Added photo to community ${newCommunity.id}`);
    }
    
    // Clear the verification code
    const { error: clearCodeError } = await supabase
      .from('profiles')
      .update({ current_telegram_code: null })
      .eq('id', owner.id);
      
    if (clearCodeError) {
      await logger.warn(`⚠️ Failed to clear verification code:`, clearCodeError);
      // Continue anyway as this is not critical
    }
    
    await logger.success(`✅ Successfully created and verified community ${newCommunity.id} for owner ${owner.id}`);
    
    // Try to delete the verification message
    if (message.message_id) {
      try {
        // Log the exact parameters we're using
        await logger.info(`Attempting to delete message with:`, {
          chat_id: message.chat.id, 
          message_id: message.message_id,
          raw_message: message
        });

        // For channels, we need to make sure we have the right permissions
        if (message.chat.type === 'channel') {
          const adminResponse = await fetch(`https://api.telegram.org/bot${botToken}/getChatAdministrators`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              chat_id: message.chat.id
            })
          });

          const adminData = await adminResponse.json();
          if (!adminData.ok) {
            await logger.error(`Failed to get channel administrators:`, adminData);
            return true; // Still return true as verification was successful
          }

          const botId = botToken.split(':')[0];
          const botAdmin = adminData.result.find((admin: any) => admin.user.id.toString() === botId);
          if (!botAdmin || !botAdmin.can_delete_messages) {
            await logger.error(`Bot does not have delete messages permission in channel`);
            return true;
          }
        }

        // Now try to delete the message
        const deleteResponse = await fetch(`https://api.telegram.org/bot${botToken}/deleteMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: message.chat.id,
            message_id: message.message_id
          })
        });

        if (!deleteResponse.ok) {
          const errorData = await deleteResponse.json();
          await logger.error(`Failed to delete verification message:`, {
            error: errorData,
            status: deleteResponse.status,
            statusText: deleteResponse.statusText
          });
        } else {
          await logger.info(`🗑️ Deleted verification message`);
        }
      } catch (deleteError) {
        await logger.warn(`⚠️ Could not delete verification message:`, deleteError);
        // Continue anyway
      }
    } else {
      await logger.warn(`⚠️ No message_id found, cannot delete verification message`);
    }
    
    return true;
  } catch (error) {
    await logger.error(`❌ Error in verification:`, error);
    return false;
  }
}
