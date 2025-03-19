
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { getLogger, logToDatabase } from '../../services/loggerService.ts';
import { 
  isVerificationMessage, 
  checkExistingChat, 
  findVerificationInBotSettings, 
  findVerificationInProfiles 
} from './verificationUtils.ts';
import { handleProfileVerification } from './profileVerificationHandler.ts';
import { handleBotSettingsVerification } from './botSettingsVerificationHandler.ts';

const logger = getLogger('verification-handler');

export async function handleVerificationMessage(supabase: ReturnType<typeof createClient>, message: any) {
  try {
    // Check if this is a verification message
    if (!isVerificationMessage(message)) {
      logger.debug('Message does not start with MBF_ prefix, skipping verification');
      return false;
    }

    const verificationCode = message.text.trim();
    const chatId = String(message.chat.id);

    logger.info(`[Verification] Processing code: ${verificationCode}`);
    logger.info(`[Verification] Chat ID: ${chatId}`);
    logger.info(`[Verification] Chat type: ${message.chat.type}`);
    logger.info(`[Verification] Message from: ${message.from?.id || 'unknown'}`);
    
    // Log full message for debugging
    await logToDatabase(supabase, 'VERIFICATION', 'INFO', 'Full verification message', message);

    // Check if chat ID already exists in the system
    const { existingChatCommunity } = await checkExistingChat(supabase, chatId);
    
    // First check if verification code exists in bot_settings
    const { botSettings } = await findVerificationInBotSettings(supabase, verificationCode);

    // If found in bot_settings, handle via bot settings method
    if (botSettings) {
      return await handleBotSettingsVerification(supabase, botSettings, chatId, message, existingChatCommunity);
    } 
    
    // If not found in bot_settings, check profiles (legacy method)
    logger.info('[Verification] Code not found in bot_settings, checking profiles');
    const { profile } = await findVerificationInProfiles(supabase, verificationCode);

    if (profile) {
      return await handleProfileVerification(supabase, profile, chatId, verificationCode, message, existingChatCommunity);
    } 
    
    // No matching verification code found
    logger.warn(`[Verification] No matching profile or bot settings found for code: ${verificationCode}`);
    await logToDatabase(supabase, 'VERIFICATION', 'WARN', 'No matching profile or bot settings found', { code: verificationCode });
    return false;

  } catch (error) {
    logger.error(`[Verification] Unhandled error: ${error.message}`, error);
    await logToDatabase(supabase, 'VERIFICATION', 'ERROR', 'Unhandled error in verification process', 
      { error: error.message, stack: error.stack });
    return false;
  }
}
