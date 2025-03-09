
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

/**
 * Create or update a member record in the database
 */
export async function createOrUpdateMember(
  supabase: ReturnType<typeof createClient>, 
  memberData: any
): Promise<any> {
  try {
    console.log('[DB-LOGGER] 📝 Creating or updating member record:', memberData);
    
    // Check if the member already exists
    const { data: existingMember, error: lookupError } = await supabase
      .from('telegram_chat_members')
      .select('id')
      .eq('telegram_user_id', memberData.telegram_user_id)
      .eq('community_id', memberData.community_id)
      .maybeSingle();
    
    if (lookupError) {
      console.error('[DB-LOGGER] ❌ Error looking up existing member:', lookupError);
      throw lookupError;
    }
    
    let result;
    
    if (existingMember) {
      // Member exists, update record
      console.log('[DB-LOGGER] 🔄 Updating existing member record');
      
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
      console.log('[DB-LOGGER] ➕ Creating new member record');
      result = await supabase
        .from('telegram_chat_members')
        .insert(memberData);
    }
    
    if (result.error) {
      console.error('[DB-LOGGER] ❌ Error creating/updating member:', result.error);
      throw result.error;
    }
    
    console.log('[DB-LOGGER] ✅ Member record created/updated successfully');
    return { success: true, data: result.data };
  } catch (error) {
    console.error('[DB-LOGGER] ❌ Exception in createOrUpdateMember:', error);
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
  try {
    console.log(`[DB-LOGGER] 📝 Logging membership event: ${eventType} for user ${telegramUserId}`);
    
    const { error } = await supabase
      .from('telegram_membership_logs')
      .insert({
        telegram_user_id: telegramUserId,
        community_id: communityId,
        event_type: eventType,
        details: details
      });
    
    if (error) {
      console.error('[DB-LOGGER] ❌ Error logging membership event:', error);
    } else {
      console.log('[DB-LOGGER] ✅ Membership event logged successfully');
    }
  } catch (error) {
    console.error('[DB-LOGGER] ❌ Error in logMembershipEvent:', error);
  }
}
