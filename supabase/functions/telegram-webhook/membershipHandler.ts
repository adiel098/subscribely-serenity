
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { logMembershipChange } from './handlers/utils/logHelper.ts';
import { createOrUpdateMember } from './handlers/utils/dbLogger.ts';

export async function handleChatMemberUpdate(supabase: ReturnType<typeof createClient>, update: any) {
  console.log('[MEMBERSHIP] 👤 Handling chat member update:', JSON.stringify(update, null, 2));
  
  try {
    // Extract user and chat information
    const chatId = update.chat.id.toString();
    const userId = update.new_chat_member?.user?.id?.toString();
    const status = update.new_chat_member?.status;
    const username = update.new_chat_member?.user?.username;
    
    console.log(`[MEMBERSHIP] 📝 Chat: ${chatId}, User: ${userId}, Status: ${status}, Username: ${username || 'none'}`);
    
    // Lookup community by chat ID
    const { data: community, error: communityError } = await supabase
      .from('communities')
      .select('id')
      .eq('telegram_chat_id', chatId)
      .single();
      
    if (communityError || !community) {
      console.error('[MEMBERSHIP] ❌ Community not found for chat ID:', chatId, communityError);
      return;
    }
    
    console.log(`[MEMBERSHIP] ✅ Found community: ${community.id}`);
    
    // Handle different status updates
    if (status === 'member') {
      console.log(`[MEMBERSHIP] ✅ User ${userId} added to chat ${chatId}`);
      
      // Update member status in database
      const memberResult = await createOrUpdateMember(supabase, {
        telegram_user_id: userId,
        telegram_username: username,
        community_id: community.id,
        is_active: true,
      });
        
      if (!memberResult.success) {
        console.error('[MEMBERSHIP] ❌ Error updating member status:', memberResult.error);
      } else {
        console.log(`[MEMBERSHIP] ✅ Successfully updated member status for user ${userId}`);
        
        // Log the membership change
        await logMembershipChange(
          supabase,
          chatId,
          userId,
          username,
          'added',
          'User added to group',
          update
        );
      }
      
      // Update community member count
      await updateCommunityMemberCount(supabase, community.id);
    } 
    else if (status === 'left' || status === 'kicked') {
      console.log(`[MEMBERSHIP] ❌ User ${userId} removed from chat ${chatId}`);
      
      // Update member status in database
      const memberResult = await createOrUpdateMember(supabase, {
        telegram_user_id: userId,
        telegram_username: username,
        community_id: community.id,
        is_active: false,
        subscription_status: false
      });
        
      if (!memberResult.success) {
        console.error('[MEMBERSHIP] ❌ Error updating member status:', memberResult.error);
      } else {
        console.log(`[MEMBERSHIP] ✅ Successfully updated member status for user ${userId}`);
        
        // Log the membership change
        await logMembershipChange(
          supabase,
          chatId,
          userId,
          username,
          'removed',
          'User left or was kicked from group',
          update
        );
      }
      
      // Update community member count
      await updateCommunityMemberCount(supabase, community.id);
    }
  } catch (error) {
    console.error('[MEMBERSHIP] ❌ Error handling chat member update:', error);
  }
}

export async function handleMyChatMember(supabase: ReturnType<typeof createClient>, update: any) {
  console.log('[MEMBERSHIP] 🤖 Handling my chat member update:', JSON.stringify(update, null, 2));
  
  try {
    // Extract chat information
    const chatId = update.chat.id.toString();
    const status = update.new_chat_member?.status;
    
    console.log(`[MEMBERSHIP] 📝 Bot status changed in chat ${chatId} to: ${status}`);
    
    // If bot was removed from the group
    if (status === 'left' || status === 'kicked') {
      console.log(`[MEMBERSHIP] ❌ Bot was removed from chat ${chatId}`);
      
      // Update community record
      const { error: communityError } = await supabase
        .from('communities')
        .update({
          telegram_invite_link: null
        })
        .eq('telegram_chat_id', chatId);
        
      if (communityError) {
        console.error('[MEMBERSHIP] ❌ Error updating community record:', communityError);
      } else {
        console.log(`[MEMBERSHIP] ✅ Successfully updated community record for chat ${chatId}`);
      }
    }
  } catch (error) {
    console.error('[MEMBERSHIP] ❌ Error handling my chat member update:', error);
  }
}

export async function updateMemberActivity(supabase: ReturnType<typeof createClient>, userId: string) {
  console.log('[MEMBERSHIP] 🔄 Updating member activity for user:', userId);
  
  try {
    // Update last_active timestamp for all communities this user is in
    const { error: memberError } = await supabase
      .from('telegram_chat_members')
      .update({
        last_active: new Date().toISOString()
      })
      .eq('telegram_user_id', userId);
      
    if (memberError) {
      console.error('[MEMBERSHIP] ❌ Error updating member activity:', memberError);
    } else {
      console.log(`[MEMBERSHIP] ✅ Successfully updated activity for user ${userId}`);
    }
  } catch (error) {
    console.error('[MEMBERSHIP] ❌ Error in updateMemberActivity:', error);
  }
}

// Helper function to update community member counts
async function updateCommunityMemberCount(supabase: ReturnType<typeof createClient>, communityId: string) {
  try {
    console.log(`[MEMBERSHIP] 📊 Updating member counts for community ${communityId}`);
    
    // Count active members
    const { count: memberCount, error: countError } = await supabase
      .from('telegram_chat_members')
      .select('id', { count: 'exact', head: true })
      .eq('community_id', communityId)
      .eq('is_active', true);
    
    if (countError) {
      console.error('[MEMBERSHIP] ❌ Error counting members:', countError);
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
      console.error('[MEMBERSHIP] ❌ Error counting subscribers:', subCountError);
      return;
    }
    
    console.log(`[MEMBERSHIP] 📊 Member count: ${memberCount}, Subscription count: ${subscriptionCount}`);
    
    // Update community record
    const { error: updateError } = await supabase
      .from('communities')
      .update({ 
        member_count: memberCount || 0,
        subscription_count: subscriptionCount || 0
      })
      .eq('id', communityId);
    
    if (updateError) {
      console.error('[MEMBERSHIP] ❌ Error updating community counts:', updateError);
    } else {
      console.log(`[MEMBERSHIP] ✅ Updated community ${communityId} counts successfully`);
    }
  } catch (error) {
    console.error('[MEMBERSHIP] ❌ Error in updateCommunityMemberCount:', error);
  }
}
