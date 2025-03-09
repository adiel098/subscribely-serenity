
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { logMembershipChange } from './utils/logHelper.ts';
import { createOrUpdateMember } from './utils/dbLogger.ts';
import { updateCommunityMemberCount } from './utils/communityCountUtils.ts';

/**
 * Handles chat member status updates
 * @param supabase Supabase client
 * @param update Telegram chat member update data
 */
export async function handleChatMemberUpdate(supabase: ReturnType<typeof createClient>, update: any) {
  console.log('[MEMBER-UPDATE] 👤 Handling chat member update:', JSON.stringify(update, null, 2));
  
  try {
    // Extract user and chat information
    const chatId = update.chat.id.toString();
    const userId = update.new_chat_member?.user?.id?.toString();
    const status = update.new_chat_member?.status;
    const username = update.new_chat_member?.user?.username;
    
    console.log(`[MEMBER-UPDATE] 📝 Chat: ${chatId}, User: ${userId}, Status: ${status}, Username: ${username || 'none'}`);
    
    // Lookup community by chat ID
    const { data: community, error: communityError } = await supabase
      .from('communities')
      .select('id')
      .eq('telegram_chat_id', chatId)
      .single();
      
    if (communityError || !community) {
      console.error('[MEMBER-UPDATE] ❌ Community not found for chat ID:', chatId, communityError);
      return;
    }
    
    console.log(`[MEMBER-UPDATE] ✅ Found community: ${community.id}`);
    
    // Handle different status updates
    if (status === 'member') {
      console.log(`[MEMBER-UPDATE] ✅ User ${userId} added to chat ${chatId}`);
      
      // Update member status in database
      const memberResult = await createOrUpdateMember(supabase, {
        telegram_user_id: userId,
        telegram_username: username,
        community_id: community.id,
        is_active: true,
        subscription_status: 'active' // Use the standardized status value
      });
        
      if (!memberResult.success) {
        console.error('[MEMBER-UPDATE] ❌ Error updating member status:', memberResult.error);
      } else {
        console.log(`[MEMBER-UPDATE] ✅ Successfully updated member status for user ${userId}`);
        
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
      console.log(`[MEMBER-UPDATE] ❌ User ${userId} removed from chat ${chatId}`);
      
      // Update member status in database with standardized values
      const memberResult = await createOrUpdateMember(supabase, {
        telegram_user_id: userId,
        telegram_username: username,
        community_id: community.id,
        is_active: false,
        subscription_status: "removed"  // Using the standardized status value
      });
        
      if (!memberResult.success) {
        console.error('[MEMBER-UPDATE] ❌ Error updating member status:', memberResult.error);
      } else {
        console.log(`[MEMBER-UPDATE] ✅ Successfully updated member status for user ${userId}`);
        
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
    console.error('[MEMBER-UPDATE] ❌ Error handling chat member update:', error);
  }
}
