
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

/**
 * Update the member and subscription counts for a community
 */
export async function updateCommunityMemberCount(
  supabase: ReturnType<typeof createClient>,
  communityId: string
): Promise<boolean> {
  try {
    console.log(`[COMMUNITY-COUNTS] 🔄 Updating counts for community ${communityId}`);
    
    // Count all members in the community
    const { data: membersCount, error: membersError } = await supabase
      .from('community_subscribers') // Updated from telegram_chat_members
      .select('id', { count: 'exact', head: true })
      .eq('community_id', communityId);
    
    if (membersError) {
      console.error('[COMMUNITY-COUNTS] ❌ Error counting members:', membersError);
      return false;
    }
    
    // Count active subscriptions
    const { data: subscriptionsCount, error: subsError } = await supabase
      .from('community_subscribers') // Updated from telegram_chat_members
      .select('id', { count: 'exact', head: true })
      .eq('community_id', communityId)
      .eq('subscription_status', 'active'); // Updated from boolean to 'active' string
    
    if (subsError) {
      console.error('[COMMUNITY-COUNTS] ❌ Error counting subscriptions:', subsError);
      return false;
    }
    
    // Update the community record
    const { error: updateError } = await supabase
      .from('communities')
      .update({
        member_count: membersCount?.count || 0,
        subscription_count: subscriptionsCount?.count || 0,
        updated_at: new Date().toISOString()
      })
      .eq('id', communityId);
    
    if (updateError) {
      console.error('[COMMUNITY-COUNTS] ❌ Error updating community counts:', updateError);
      return false;
    }
    
    console.log(`[COMMUNITY-COUNTS] ✅ Successfully updated community counts: ${membersCount?.count} members, ${subscriptionsCount?.count} subscriptions`);
    return true;
  } catch (error) {
    console.error('[COMMUNITY-COUNTS] ❌ Exception in updateCommunityMemberCount:', error);
    return false;
  }
}
