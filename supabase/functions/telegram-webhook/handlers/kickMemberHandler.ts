
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

export async function kickMember(
  supabase: ReturnType<typeof createClient>,
  chatId: string,
  userId: string,
  botToken: string
) {
  try {
    console.log('[Kick] Attempting to kick user:', { chatId, userId });
    
    // Validate inputs
    if (!chatId || !userId || !botToken) {
      console.error('[Kick] Missing required parameters:', { 
        hasChatId: !!chatId, 
        hasUserId: !!userId, 
        hasBotToken: !!botToken 
      });
      return false;
    }

    // First try to kick the member using banChatMember with a short ban time
    // This is the recommended approach for kicking members
    const kickResponse = await fetch(`https://api.telegram.org/bot${botToken}/banChatMember`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        user_id: userId,
        until_date: Math.floor(Date.now() / 1000) + 40 // 40 seconds ban (minimum allowed by Telegram)
      })
    });

    const kickResult = await kickResponse.json();
    console.log('[Kick] Kick result:', kickResult);

    if (!kickResult.ok) {
      // If banChatMember failed, try the deprecated kickChatMember method as fallback
      console.warn('[Kick] banChatMember failed, trying kickChatMember as fallback');
      
      const fallbackKickResponse = await fetch(`https://api.telegram.org/bot${botToken}/kickChatMember`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          user_id: userId
        })
      });
      
      const fallbackResult = await fallbackKickResponse.json();
      console.log('[Kick] Fallback kick result:', fallbackResult);
      
      if (!fallbackResult.ok) {
        console.error('[Kick] Both kick methods failed:', fallbackResult.description);
        return false;
      }
    }

    // After a short delay, unban the user to allow them to rejoin in the future
    // Wait 2 seconds before unbanning
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const unbanResponse = await fetch(`https://api.telegram.org/bot${botToken}/unbanChatMember`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        user_id: userId,
        only_if_banned: true
      })
    });

    const unbanResult = await unbanResponse.json();
    console.log('[Kick] Unban result:', unbanResult);

    // Update the database status
    const { error: dbError } = await supabase
      .from('telegram_chat_members')
      .update({
        is_active: false,
        subscription_status: false,
        subscription_end_date: new Date().toISOString()
      })
      .eq('telegram_user_id', userId)
      .eq('community_id', chatId);

    if (dbError) {
      console.error('[Kick] Error updating database:', dbError);
      // Don't return false here, we successfully kicked the user
    }

    // Log the action
    await supabase
      .from('subscription_activity_logs')
      .insert({
        telegram_user_id: userId,
        community_id: chatId,
        activity_type: 'member_kicked',
        details: 'Member removed from channel due to subscription cancellation'
      });

    return true;
  } catch (error) {
    console.error('[Kick] Error:', error);
    return false;
  }
}
