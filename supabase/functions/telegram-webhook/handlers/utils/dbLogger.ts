
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { createLogger } from '../../services/loggingService.ts';

/**
 * Create or update a member record in the database
 */
export async function createOrUpdateMember(
  supabase: ReturnType<typeof createClient>, 
  memberData: any
): Promise<any> {
  const logger = createLogger(supabase, 'DB-LOGGER');
  
  try {
    await logger.info('Creating or updating member record:', memberData);
    
    // Check if the member already exists
    const { data: existingMember, error: lookupError } = await supabase
      .from('telegram_chat_members')
      .select('id')
      .eq('telegram_user_id', memberData.telegram_user_id)
      .eq('community_id', memberData.community_id)
      .maybeSingle();
    
    if (lookupError) {
      await logger.error('Error looking up existing member:', lookupError);
      throw lookupError;
    }
    
    let result;
    
    if (existingMember) {
      // Member exists, update record
      await logger.info('Updating existing member record');
      
      // Get only the fields we want to update
      const updateData = { ...memberData };
      delete updateData.telegram_user_id; // Don't update the primary key
      delete updateData.community_id; // Don't update the primary key
      
      result = await supabase
        .from('telegram_chat_members')
        .update(updateData)
        .eq('telegram_user_id', memberData.telegram_user_id)
        .eq('community_id', memberData.community_id);
    } else {
      // Member doesn't exist, create new record
      await logger.info('Creating new member record');
      result = await supabase
        .from('telegram_chat_members')
        .insert(memberData);
    }
    
    if (result.error) {
      await logger.error('Error creating/updating member:', result.error);
      throw result.error;
    }
    
    await logger.success('Member record created/updated successfully');
    return { success: true, data: result.data };
  } catch (error) {
    await logger.error('Exception in createOrUpdateMember:', error);
    return { success: false, error };
  }
}

/**
 * Log a membership event
 */
export async function logMembershipEvent(
  supabase: ReturnType<typeof createClient>,
  telegramUserId: string,
  communityId: string,
  eventType: string,
  details: any
): Promise<void> {
  const logger = createLogger(supabase, 'DB-LOGGER');
  
  try {
    await logger.info(`Logging membership event: ${eventType} for user ${telegramUserId}`);
    
    const { error } = await supabase
      .from('telegram_membership_logs')
      .insert({
        telegram_user_id: telegramUserId,
        community_id: communityId,
        event_type: eventType,
        details: details
      });
    
    if (error) {
      await logger.error('Error logging membership event:', error);
    } else {
      await logger.success('Membership event logged successfully');
    }
  } catch (error) {
    await logger.error('Error in logMembershipEvent:', error);
  }
}
