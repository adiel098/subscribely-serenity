
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

/**
 * Updates member and subscription counts for a community
 * @param supabase Supabase client
 * @param communityId Community ID
 */
export async function updateCommunityMemberCount(supabase: ReturnType<typeof createClient>, communityId: string) {
  try {
    console.log(`[COUNT-UTILS] 📊 Updating member counts for community ${communityId}`);
    
    // Count active members
    const { count: memberCount, error: countError } = await supabase
      .from('telegram_chat_members')
      .select('id', { count: 'exact', head: true })
      .eq('community_id', communityId)
      .eq('is_active', true);
    
    if (countError) {
      console.error('[COUNT-UTILS] ❌ Error counting members:', countError);
      return;
    }
    
    // Count active subscribers
    const { count: subscriptionCount, error: subCountError } = await supabase
      .from('telegram_chat_members')
      .select('id', { count: 'exact', head: true })
      .eq('community_id', communityId)
      .eq('is_active', true)
      .eq('subscription_status', true);
    
    if (subCountError) {
      console.error('[COUNT-UTILS] ❌ Error counting subscribers:', subCountError);
      return;
    }
    
    console.log(`[COUNT-UTILS] 📊 Member count: ${memberCount}, Subscription count: ${subscriptionCount}`);
    
    // Update community record
    const { error: updateError } = await supabase
      .from('communities')
      .update({ 
        member_count: memberCount || 0,
        subscription_count: subscriptionCount || 0
      })
      .eq('id', communityId);
    
    if (updateError) {
      console.error('[COUNT-UTILS] ❌ Error updating community counts:', updateError);
    } else {
      console.log(`[COUNT-UTILS] ✅ Updated community ${communityId} counts successfully`);
    }
  } catch (error) {
    console.error('[COUNT-UTILS] ❌ Error in updateCommunityMemberCount:', error);
  }
}
