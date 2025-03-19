
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { getLogger, logToDatabase } from '../../services/loggerService.ts';

const logger = getLogger('duplicate-handler');

/**
 * Handle cases where a chat ID is already used by another user
 */
export async function handleDuplicateChatId(
  supabase: ReturnType<typeof createClient>, 
  chatId: string, 
  existingOwnerId: string, 
  requestingUserId: string, 
  verificationCode: string
): Promise<boolean> {
  logger.warn(`[Verification] Duplicate attempt: User ${requestingUserId} trying to connect chat ${chatId} but it's already owned by ${existingOwnerId}`);
  
  await logToDatabase(supabase, 'VERIFICATION', 'WARN', 'Duplicate chat connection attempt', {
    requesting_user_id: requestingUserId,
    chat_id: chatId,
    existing_owner_id: existingOwnerId,
    verification_code: verificationCode
  });
  
  return false;
}

/**
 * Handle cases where a chat ID is already connected to a different community
 */
export async function handleDuplicateCommunity(
  supabase: ReturnType<typeof createClient>,
  chatId: string, 
  existingCommunityId: string, 
  requestedCommunityId: string
): Promise<boolean> {
  logger.warn(`[Verification] Chat ID ${chatId} already connected to a different community: ${existingCommunityId}`);
  
  await logToDatabase(supabase, 'VERIFICATION', 'WARN', 'Chat ID already connected to a different community', {
    chat_id: chatId,
    existing_community_id: existingCommunityId,
    requested_community_id: requestedCommunityId
  });
  
  return false;
}
