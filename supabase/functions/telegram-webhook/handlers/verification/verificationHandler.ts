
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { createLogger } from '../../services/loggingService.ts';

/**
 * Handle verification messages from Telegram users
 */
export async function handleVerificationMessage(
  supabase: ReturnType<typeof createClient>,
  message: any
): Promise<boolean> {
  const logger = createLogger(supabase, 'VERIFICATION-HANDLER');
  
  try {
    const code = message.text;
    const userId = message.from.id.toString();
    
    await logger.info(`Processing verification code "${code}" from user ${userId}`);
    
    // Extract community ID from the verification code format MBF_XXXXX
    const codePrefix = 'MBF_';
    if (!code.startsWith(codePrefix)) {
      await logger.info(`Invalid verification code format: ${code}`);
      return false;
    }
    
    const verificationId = code.substring(codePrefix.length);
    
    // Check for a pending verification with this code
    const { data: verification, error } = await supabase
      .from('telegram_verifications')
      .select('*')
      .eq('verification_code', verificationId)
      .eq('status', 'pending')
      .single();
    
    if (error || !verification) {
      await logger.error(`Verification not found for code ${verificationId}:`, error);
      return false;
    }
    
    // Update the verification with the Telegram user ID
    const { error: updateError } = await supabase
      .from('telegram_verifications')
      .update({
        telegram_user_id: userId,
        telegram_username: message.from.username,
        status: 'verified',
        verified_at: new Date().toISOString()
      })
      .eq('id', verification.id);
    
    if (updateError) {
      await logger.error(`Failed to update verification:`, updateError);
      return false;
    }
    
    await logger.info(`Successfully verified user ${userId} for verification ${verification.id}`);
    return true;
  } catch (error) {
    await logger.error(`Error in handleVerificationMessage:`, error);
    return false;
  }
}
