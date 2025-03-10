
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

/**
 * Update the community member count and subscription count
 */
export async function updateCommunityMemberCount(
  supabase: ReturnType<typeof createClient>, 
  communityId: string
): Promise<void> {
  try {
    console.log(`[COMMUNITY-SERVICE] 🔄 Updating counts for community ${communityId}`);
    
    // Count active members
    const { count: memberCount, error: countError } = await supabase
      .from('telegram_chat_members')
      .select('id', { count: 'exact', head: true })
      .eq('community_id', communityId)
      .eq('is_active', true);
    
    if (countError) {
      console.error('[COMMUNITY-SERVICE] ❌ Error counting members:', countError);
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
      console.error('[COMMUNITY-SERVICE] ❌ Error counting subscribers:', subCountError);
      return;
    }
    
    // Update community record
    const { error: updateError } = await supabase
      .from('communities')
      .update({ 
        member_count: memberCount || 0,
        subscription_count: subscriptionCount || 0
      })
      .eq('id', communityId);
    
    if (updateError) {
      console.error('[COMMUNITY-SERVICE] ❌ Error updating community counts:', updateError);
    } else {
      console.log(`[COMMUNITY-SERVICE] ✅ Updated community ${communityId} counts: members=${memberCount}, subscriptions=${subscriptionCount}`);
    }
  } catch (error) {
    console.error('[COMMUNITY-SERVICE] ❌ Error in updateCommunityMemberCount:', error);
  }
}
