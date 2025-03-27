
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

interface MemberDataInterface {
  telegram_user_id: string;
  telegram_username?: string;
  community_id: string;
  is_active: boolean;
  subscription_status?: string | boolean;
  subscription_plan_id?: string;
  subscription_start_date?: string;
  subscription_end_date?: string;
  is_trial?: boolean;
  trial_end_date?: string;
  first_name?: string;
  last_name?: string;
}

interface MemberResult {
  success: boolean;
  id?: string;
  error?: any;
}

/**
 * Create or update a Telegram chat member in the database
 */
export async function createOrUpdateMember(
  supabase: ReturnType<typeof createClient>,
  memberData: MemberDataInterface
): Promise<MemberResult> {
  try {
    console.log(`[DB-LOGGER] 📝 Creating/updating member for user ${memberData.telegram_user_id} in community ${memberData.community_id}`);
    
    // Ensure subscription_status is a string (no longer accepting boolean)
    if (typeof memberData.subscription_status === 'boolean') {
      memberData.subscription_status = memberData.subscription_status ? 'active' : 'inactive';
    }
    
    // First check if member exists
    const { data: existingMember, error: checkError } = await supabase
      .from('community_subscribers') // Updated table name
      .select('id')
      .eq('telegram_user_id', memberData.telegram_user_id)
      .eq('community_id', memberData.community_id)
      .maybeSingle();
    
    if (checkError) {
      console.error('[DB-LOGGER] ❌ Error checking for existing member:', checkError);
      return { success: false, error: checkError };
    }
    
    let result;
    
    if (existingMember) {
      // Update existing member
      console.log(`[DB-LOGGER] 🔄 Updating existing member ID: ${existingMember.id}`);
      const { data, error } = await supabase
        .from('community_subscribers') // Updated table name
        .update(memberData)
        .eq('id', existingMember.id)
        .select('id')
        .single();
      
      if (error) {
        console.error('[DB-LOGGER] ❌ Error updating member:', error);
        return { success: false, error: error };
      }
      
      result = { success: true, id: data.id };
    } else {
      // Create new member
      console.log('[DB-LOGGER] ➕ Creating new member record');
      const { data, error } = await supabase
        .from('community_subscribers') // Updated table name
        .insert(memberData)
        .select('id')
        .single();
      
      if (error) {
        console.error('[DB-LOGGER] ❌ Error creating member:', error);
        return { success: false, error: error };
      }
      
      result = { success: true, id: data.id };
    }
    
    console.log(`[DB-LOGGER] ✅ Member ${result.id} created/updated successfully`);
    
    // Log the activity in subscription_activity_logs
    const activityType = existingMember ? 'member_updated' : 'member_created';
    const { error: logError } = await supabase
      .from('subscription_activity_logs')
      .insert({
        telegram_user_id: memberData.telegram_user_id,
        community_id: memberData.community_id,
        activity_type: activityType,
        details: JSON.stringify(memberData),
        status: memberData.is_active ? 'active' : 'inactive',
        subscription_status: memberData.subscription_status
      });
    
    if (logError) {
      console.error('[DB-LOGGER] ❌ Error logging activity:', logError);
      // Don't fail the operation if just logging fails
    }
    
    return result;
  } catch (error) {
    console.error('[DB-LOGGER] ❌ Exception in createOrUpdateMember:', error);
    return { success: false, error: error };
  }
}
