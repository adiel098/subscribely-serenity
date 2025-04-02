
import { createLogger } from '../../_shared/logger.ts';

const logger = createLogger('logging-service');

export async function logBroadcast(
  supabase: any,
  communityId: string, 
  message: string,
  filterType: string,
  totalRecipients: number,
  planId?: string | null,
  includeButton?: boolean,
  image?: string | null
) {
  try {
    logger.log(`Logging broadcast for community ${communityId} with ${totalRecipients} recipients`);
    
    const { data, error } = await supabase
      .from('broadcast_messages')
      .insert({
        community_id: communityId,
        message: message,
        filter_type: filterType,
        total_recipients: totalRecipients,
        subscription_plan_id: planId || null,
        include_button: includeButton || false,
        image: image || null,
        status: 'sending'
      })
      .select('id')
      .single();
      
    if (error) {
      logger.error(`Error logging broadcast: ${error.message}`);
      return { error: error.message };
    }
    
    logger.log(`Broadcast logged with ID ${data.id}`);
    return { id: data.id };
  } catch (error) {
    logger.error(`Exception in logBroadcast: ${error.message}`);
    return { error: error.message };
  }
}
