
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { getLogger, logToDatabase } from '../../services/loggerService.ts';

const logger = getLogger('verification-utils');

/**
 * Checks if a chat ID already exists in the database
 */
export async function checkExistingChat(supabase: ReturnType<typeof createClient>, chatId: string) {
  const { data: existingChatCommunity, error: chatCheckError } = await supabase
    .from('communities')
    .select('id, owner_id, name')
    .eq('telegram_chat_id', chatId)
    .maybeSingle();
    
  if (chatCheckError) {
    logger.error(`Error checking existing chat: ${chatCheckError.message}`, chatCheckError);
    await logToDatabase(supabase, 'VERIFICATION', 'ERROR', 'Error checking existing chat', 
      { error: chatCheckError, chat_id: chatId });
  }
  
  return { existingChatCommunity, chatCheckError };
}

/**
 * Finds a verification code in the bot settings table
 */
export async function findVerificationInBotSettings(supabase: ReturnType<typeof createClient>, verificationCode: string) {
  const { data: botSettings, error: findError } = await supabase
    .from('telegram_bot_settings')
    .select('id, community_id, verification_code')
    .eq('verification_code', verificationCode)
    .maybeSingle();

  if (findError) {
    logger.error(`Error checking bot settings: ${findError.message}`, findError);
    await logToDatabase(supabase, 'VERIFICATION', 'ERROR', 'Error checking bot settings', 
      { error: findError, code: verificationCode });
  }

  logger.info(`Bot settings query result: ${JSON.stringify(botSettings)}`);
  return { botSettings, findError };
}

/**
 * Finds a verification code in the users table (updated from profiles)
 */
export async function findVerificationInProfiles(supabase: ReturnType<typeof createClient>, verificationCode: string) {
  // Updated to use users table instead of profiles
  const { data: user, error: userError } = await supabase
    .from('users')
    .select('id, current_telegram_code')
    .eq('current_telegram_code', verificationCode)
    .maybeSingle();

  if (userError) {
    logger.error(`Error checking users: ${userError.message}`, userError);
    await logToDatabase(supabase, 'VERIFICATION', 'ERROR', 'Error checking users', 
      { error: userError, code: verificationCode });
  }

  logger.info(`User query result: ${JSON.stringify(user)}`);
  return { user, userError };
}

/**
 * Check if a message contains a verification code
 */
export function isVerificationMessage(message: any): boolean {
  return message?.text?.startsWith('MBF_');
}
