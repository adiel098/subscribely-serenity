
import { createLogger } from '../../_shared/logger.ts';
import { broadcastToMembers } from '../services/broadcastService.ts';
import { logBroadcast } from '../services/loggingService.ts';
import { getMembersToNotify } from '../services/memberService.ts';
import { validateRequest } from '../utils/validators.ts';
import { BroadcastRequest } from '../types/types.ts';

const logger = createLogger('broadcast-handler');

export async function sendBroadcastHandler(supabase: any, botToken: string, requestData: BroadcastRequest) {
  try {
    // Validate the request data
    const validationResult = validateRequest(requestData);
    if (!validationResult.valid) {
      logger.error(`Validation error: ${validationResult.error}`);
      return { success: false, message: validationResult.error };
    }

    const {
      entityId,
      entityType = 'community',
      message,
      filterType = 'all',
      includeButton = false,
      buttonText = 'Join Community 🚀',
      buttonUrl,
      image = null,
      planId = null,
    } = requestData;

    // Get members to notify based on filter
    const { members, error: membersError, totalCount } = await getMembersToNotify(
      supabase,
      entityId,
      entityType,
      filterType,
      planId
    );

    if (membersError) {
      logger.error(`Error fetching members: ${membersError}`);
      return { success: false, message: `Error fetching members: ${membersError}` };
    }

    if (!members || members.length === 0) {
      logger.warn(`No members found to notify for ${entityType} ${entityId}`);
      return { success: true, message: 'No members found to notify', sent_count: 0, total_count: 0 };
    }

    logger.log(`Found ${members.length} members to notify for ${entityType} ${entityId}`);

    // Log the broadcast to the database
    const { id: broadcastId, error: logError } = await logBroadcast(
      supabase,
      entityId,
      message,
      filterType,
      members.length,
      planId,
      includeButton,
      image
    );

    if (logError) {
      logger.error(`Error logging broadcast: ${logError}`);
    }

    // Send the broadcast to all members
    const { successCount, failedCount } = await broadcastToMembers(
      supabase,
      members,
      message,
      botToken,
      includeButton,
      buttonText,
      buttonUrl,
      image,
      entityId
    );

    // Update the broadcast log with results
    if (broadcastId) {
      await supabase
        .from('broadcast_messages')
        .update({
          sent_success: successCount,
          sent_failed: failedCount,
          sent_at: new Date().toISOString(),
          status: 'sent'
        })
        .eq('id', broadcastId);
    }

    return {
      success: true,
      message: `Broadcast sent to ${successCount} members successfully, ${failedCount} failed`,
      sent_count: successCount,
      failed_count: failedCount,
      total_count: totalCount
    };
  } catch (error) {
    logger.error(`Error in send broadcast handler: ${error.message}`);
    return { success: false, message: `Error: ${error.message}` };
  }
}
