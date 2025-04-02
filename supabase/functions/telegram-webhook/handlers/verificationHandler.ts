import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { fetchAndUpdateCommunityPhoto } from './utils/photoHandler.ts';
import { createLogger } from '../services/loggingService.ts';

interface TelegramMessage {
  chat: {
    id: number;
    title?: string;
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
 * Handles verification of both profiles and channels/groups
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
    const chatId = message.chat.id.toString();
    
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
    
    // Look up the verification code in both tables
    await logger.info(`🔍 Looking for verification code "${code}" in profiles and telegram_bot_settings tables`);
    
    // First check profiles table
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id, current_telegram_code')
      .eq('current_telegram_code', code)
      .maybeSingle();
      
    await logger.info('Profiles query results:', { 
      data: profile, 
      error: profileError,
      query: {
        table: 'profiles',
        field: 'current_telegram_code',
        value: code
      }
    });

    // Then check telegram_bot_settings table
    const { data: botSettings, error: botError } = await supabase
      .from('telegram_bot_settings')
      .select('community_id, verification_code')
      .eq('verification_code', code)
      .is('verified_at', null)
      .maybeSingle();
      
    await logger.info('Bot settings query results:', { 
      data: botSettings, 
      error: botError,
      query: {
        table: 'telegram_bot_settings',
        field: 'verification_code',
        value: code
      }
    });

    // Handle profile verification
    if (profile) {
      await logger.info(`Found profile with ID: ${profile.id}`);
      
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          telegram_chat_id: chatId,
          telegram_verified: true,
          current_telegram_code: null // Clear the verification code after successful verification
        })
        .eq('id', profile.id);
        
      if (updateError) {
        await logger.error(`❌ Failed to update profile:`, updateError);
        return false;
      }
      
      await logger.success(`✅ Successfully verified profile ${profile.id}`);
      
      // Try to delete the verification message
      try {
        await fetch(`https://api.telegram.org/bot${botToken}/deleteMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: chatId,
            message_id: message.message_id
          })
        });
        await logger.info(`🗑️ Deleted verification message`);
      } catch (deleteError) {
        await logger.warn(`⚠️ Could not delete verification message:`, deleteError);
        // Continue anyway
      }
      
      return true;
    }
    
    // Handle bot/channel verification
    if (botSettings) {
      await logger.info(`Found bot settings for community: ${botSettings.community_id}`);
      
      // Create new community
      const { data: newCommunity, error: communityError } = await supabase
        .from('communities')
        .insert({
          name: message.chat.title || 'Telegram Community',
          platform: 'telegram',
          telegram_chat_id: chatId,
          platform_id: chatId,
          chat_type: message.chat.type
        })
        .select()
        .single();
        
      if (communityError) {
        await logger.error(`❌ Failed to create community:`, communityError);
        return false;
      }
      
      // Update bot settings
      const { error: updateError } = await supabase
        .from('telegram_bot_settings')
        .update({
          chat_id: chatId,
          verified_at: new Date().toISOString()
        })
        .eq('community_id', botSettings.community_id);
        
      if (updateError) {
        await logger.error(`❌ Failed to update bot settings:`, updateError);
        return false;
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
      
      await logger.success(`✅ Successfully verified community ${newCommunity.id}`);
      return true;
    }
    
    // If we got here, the code wasn't found in either table
    await logger.error(`❌ Verification code not found in any table: ${code}`);
    return false;
  } catch (error) {
    await logger.error(`❌ Error in verification:`, error);
    return false;
  }
}
