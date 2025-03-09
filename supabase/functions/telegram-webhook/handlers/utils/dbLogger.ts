
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

/**
 * Creates or updates a telegram_chat_member record
 */
export async function createOrUpdateMember(supabase: ReturnType<typeof createClient>, memberData: any) {
  try {
    console.log('[DB-LOGGER] Creating/updating member with data:', JSON.stringify(memberData, null, 2));
    
    // Ensure subscription_status is a string when passed to the database
    if (typeof memberData.subscription_status === 'boolean') {
      // Convert boolean to standardized status string
      memberData.subscription_status = memberData.subscription_status ? 'active' : 'inactive';
    }
    
    // For backward compatibility, check if old format was used
    if (memberData.subscription_status === true) {
      memberData.subscription_status = 'active';
    } else if (memberData.subscription_status === false) {
      memberData.subscription_status = 'inactive';
    }
    
    // Check if member exists
    const { data: existingMember, error: memberQueryError } = await supabase
      .from('telegram_chat_members')
      .select('id')
      .eq('telegram_user_id', memberData.telegram_user_id)
      .eq('community_id', memberData.community_id)
      .maybeSingle();
      
    if (memberQueryError) {
      console.error('[DB-LOGGER] Error checking for existing member:', memberQueryError);
      return { success: false, error: memberQueryError };
    }
    
    if (existingMember) {
      // Update existing member
      console.log(`[DB-LOGGER] Updating existing member record: ${existingMember.id}`);
      const { error: updateError } = await supabase
        .from('telegram_chat_members')
        .update(memberData)
        .eq('id', existingMember.id);
        
      if (updateError) {
        console.error('[DB-LOGGER] Error updating member:', updateError);
        return { success: false, error: updateError };
      }
      
      return { success: true, id: existingMember.id };
    } else {
      // Create new member
      console.log('[DB-LOGGER] Creating new member record');
      
      // Make sure joined_at is set if not provided
      if (!memberData.joined_at) {
        memberData.joined_at = new Date().toISOString();
      }
      
      const { data: newMember, error: insertError } = await supabase
        .from('telegram_chat_members')
        .insert(memberData)
        .select('id')
        .single();
        
      if (insertError) {
        console.error('[DB-LOGGER] Error creating member:', insertError);
        return { success: false, error: insertError };
      }
      
      return { success: true, id: newMember.id };
    }
  } catch (error) {
    console.error('[DB-LOGGER] Error in createOrUpdateMember:', error);
    return { success: false, error };
  }
}
