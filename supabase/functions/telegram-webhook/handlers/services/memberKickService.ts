
/**
 * Service for kicking members from Telegram chats
 */
export async function kickMemberService(
  supabase: any,
  chatId: string,
  userId: string,
  botToken: string
): Promise<boolean> {
  console.log(`[KICK SERVICE] 🚫 Starting kick operation for user ${userId} from chat ${chatId}`);
  
  try {
    // Ensure we have valid parameters
    if (!chatId || !userId || !botToken) {
      console.error('[KICK SERVICE] ❌ Missing required parameters');
      return false;
    }
    
    // First, get the community ID from the chat ID (for database operations)
    const { data: community, error: communityError } = await supabase
      .from('communities')
      .select('id')
      .eq('telegram_chat_id', chatId)
      .single();
      
    if (communityError) {
      console.error('[KICK SERVICE] ❌ Error fetching community:', communityError);
      throw new Error('Failed to fetch community');
    }
    
    const communityId = community?.id;
    console.log(`[KICK SERVICE] 🏠 Found community ID: ${communityId}`);
    
    // Execute the kick via Telegram API
    const kickResponse = await fetch(`https://api.telegram.org/bot${botToken}/banChatMember`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: chatId,
        user_id: userId,
        until_date: Math.floor(Date.now() / 1000) + 45, // Ban for minimal time (unban after 45 seconds)
        revoke_messages: false // Don't delete user's messages
      }),
    });

    const kickResult = await kickResponse.json();
    
    if (!kickResult.ok) {
      console.error('[KICK SERVICE] ❌ Telegram API error:', kickResult.description);
      throw new Error(`Telegram API error: ${kickResult.description}`);
    }
    
    console.log('[KICK SERVICE] ✅ Successfully kicked user from Telegram');
    
    // Update member status in database
    const { data: member, error: memberError } = await supabase
      .from('telegram_chat_members')
      .select('id')
      .eq('telegram_user_id', userId)
      .eq('community_id', communityId)
      .single();
      
    if (memberError) {
      console.error('[KICK SERVICE] ❌ Error finding member in database:', memberError);
      // Continue despite error as the kick was successful
    } else if (member?.id) {
      // Update the member status to inactive in database
      const { error: updateError } = await supabase
        .from('telegram_chat_members')
        .update({
          is_active: false,
          subscription_status: false
          // No longer updating subscription_end_date as requested
        })
        .eq('id', member.id);
        
      if (updateError) {
        console.error('[KICK SERVICE] ❌ Error updating member status:', updateError);
        // Continue despite error as the kick was successful
      } else {
        console.log('[KICK SERVICE] ✅ Successfully updated member status in database');
      }
    }
    
    // Make sure to invalidate invite links
    const { error: invalidateError } = await supabase
      .from('subscription_payments')
      .update({ invite_link: null })
      .eq('telegram_user_id', userId)
      .eq('community_id', communityId);
      
    if (invalidateError) {
      console.error('[KICK SERVICE] ❌ Error invalidating invite links:', invalidateError);
      // Continue despite error as the kick was successful
    } else {
      console.log('[KICK SERVICE] 🔗 Successfully invalidated invite links');
    }
    
    return true;
  } catch (error) {
    console.error('[KICK SERVICE] ❌ Error in kick service:', error);
    return false;
  }
}
