
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { handleChannelPost } from './handlers/channelPost.ts';
import { handleNewMessage, handleEditedMessage } from './handlers/messageHandler.ts';
import { handleChatJoinRequest } from './handlers/joinRequestHandler.ts';

export async function handleChatMemberUpdate(supabase: ReturnType<typeof createClient>, update: any) {
  console.log('[MEMBERSHIP] Handling chat member update:', JSON.stringify(update, null, 2));
  
  try {
    // Extract user and chat information
    const chatId = update.chat.id.toString();
    const userId = update.new_chat_member?.user?.id?.toString();
    const status = update.new_chat_member?.status;
    
    console.log(`[MEMBERSHIP] Chat: ${chatId}, User: ${userId}, Status: ${status}`);
    
    // Lookup community by chat ID
    const { data: community, error: communityError } = await supabase
      .from('communities')
      .select('id')
      .eq('telegram_chat_id', chatId)
      .single();
      
    if (communityError || !community) {
      console.error('[MEMBERSHIP] Community not found for chat ID:', chatId, communityError);
      return;
    }
    
    console.log(`[MEMBERSHIP] Found community: ${community.id}`);
    
    // Handle different status updates
    if (status === 'member') {
      console.log(`[MEMBERSHIP] User ${userId} added to chat ${chatId}`);
      
      // Update member status in database
      const { error: memberError } = await supabase
        .from('telegram_chat_members')
        .upsert({
          telegram_user_id: userId,
          community_id: community.id,
          is_active: true,
          joined_at: new Date().toISOString(),
          last_active: new Date().toISOString()
        }, {
          onConflict: 'telegram_user_id,community_id'
        });
        
      if (memberError) {
        console.error('[MEMBERSHIP] Error updating member status:', memberError);
      } else {
        console.log(`[MEMBERSHIP] Successfully updated member status for user ${userId}`);
      }
    } 
    else if (status === 'left' || status === 'kicked') {
      console.log(`[MEMBERSHIP] User ${userId} removed from chat ${chatId}`);
      
      // Update member status in database
      const { error: memberError } = await supabase
        .from('telegram_chat_members')
        .update({
          is_active: false,
          subscription_status: false
        })
        .eq('telegram_user_id', userId)
        .eq('community_id', community.id);
        
      if (memberError) {
        console.error('[MEMBERSHIP] Error updating member status:', memberError);
      } else {
        console.log(`[MEMBERSHIP] Successfully updated member status for user ${userId}`);
      }
    }
  } catch (error) {
    console.error('[MEMBERSHIP] Error handling chat member update:', error);
  }
}

export async function handleMyChatMember(supabase: ReturnType<typeof createClient>, update: any) {
  console.log('[MEMBERSHIP] Handling my chat member update:', JSON.stringify(update, null, 2));
  
  try {
    // Extract chat information
    const chatId = update.chat.id.toString();
    const status = update.new_chat_member?.status;
    
    console.log(`[MEMBERSHIP] Bot status changed in chat ${chatId} to: ${status}`);
    
    // If bot was removed from the group
    if (status === 'left' || status === 'kicked') {
      console.log(`[MEMBERSHIP] Bot was removed from chat ${chatId}`);
      
      // Update community record
      const { error: communityError } = await supabase
        .from('communities')
        .update({
          telegram_invite_link: null
        })
        .eq('telegram_chat_id', chatId);
        
      if (communityError) {
        console.error('[MEMBERSHIP] Error updating community record:', communityError);
      } else {
        console.log(`[MEMBERSHIP] Successfully updated community record for chat ${chatId}`);
      }
    }
  } catch (error) {
    console.error('[MEMBERSHIP] Error handling my chat member update:', error);
  }
}

export async function updateMemberActivity(supabase: ReturnType<typeof createClient>, userId: string) {
  console.log('[MEMBERSHIP] Updating member activity for user:', userId);
  
  try {
    // Update last_active timestamp for all communities this user is in
    const { error: memberError } = await supabase
      .from('telegram_chat_members')
      .update({
        last_active: new Date().toISOString()
      })
      .eq('telegram_user_id', userId);
      
    if (memberError) {
      console.error('[MEMBERSHIP] Error updating member activity:', memberError);
    } else {
      console.log(`[MEMBERSHIP] Successfully updated activity for user ${userId}`);
    }
  } catch (error) {
    console.error('[MEMBERSHIP] Error in updateMemberActivity:', error);
  }
}

export {
  handleChannelPost,
  handleNewMessage,
  handleEditedMessage,
  handleChatJoinRequest
};
