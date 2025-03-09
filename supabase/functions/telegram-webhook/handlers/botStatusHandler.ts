
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

/**
 * Handles updates to the bot's own status in a chat
 * @param supabase Supabase client
 * @param update Telegram my_chat_member update data
 */
export async function handleMyChatMember(supabase: ReturnType<typeof createClient>, update: any) {
  console.log('[BOT-STATUS] 🤖 Handling my chat member update:', JSON.stringify(update, null, 2));
  
  try {
    // Extract chat information
    const chatId = update.chat.id.toString();
    const status = update.new_chat_member?.status;
    
    console.log(`[BOT-STATUS] 📝 Bot status changed in chat ${chatId} to: ${status}`);
    
    // If bot was removed from the group
    if (status === 'left' || status === 'kicked') {
      console.log(`[BOT-STATUS] ❌ Bot was removed from chat ${chatId}`);
      
      // Update community record
      const { error: communityError } = await supabase
        .from('communities')
        .update({
          telegram_invite_link: null
        })
        .eq('telegram_chat_id', chatId);
        
      if (communityError) {
        console.error('[BOT-STATUS] ❌ Error updating community record:', communityError);
      } else {
        console.log(`[BOT-STATUS] ✅ Successfully updated community record for chat ${chatId}`);
      }
    }
  } catch (error) {
    console.error('[BOT-STATUS] ❌ Error handling my chat member update:', error);
  }
}
