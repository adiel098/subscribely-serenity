
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

/**
 * Handles the 'my_chat_member' updates which occur when the bot's status in a chat changes
 * (added, removed, permissions changed, etc.)
 */
export async function handleMyChatMember(supabase: ReturnType<typeof createClient>, update: any) {
  console.log('[BOT-STATUS] 🤖 Handling my_chat_member update:', JSON.stringify(update, null, 2));
  
  try {
    // Extract relevant information
    const chatId = update.chat.id.toString();
    const chatType = update.chat.type;
    const newStatus = update.new_chat_member?.status;
    const oldStatus = update.old_chat_member?.status;
    
    console.log(`[BOT-STATUS] 📋 Chat ID: ${chatId}, Type: ${chatType}, Status change: ${oldStatus} -> ${newStatus}`);
    
    // Handle bot being added to a chat
    if (['member', 'administrator'].includes(newStatus) && oldStatus === 'left') {
      console.log(`[BOT-STATUS] ✅ Bot was added to ${chatType} ${chatId}`);
      
      // Check if community exists for this chat
      const { data: existingCommunity, error: communityError } = await supabase
        .from('communities')
        .select('id, name')
        .eq('telegram_chat_id', chatId)
        .maybeSingle();
      
      if (communityError) {
        console.error('[BOT-STATUS] ❌ Error checking for existing community:', communityError);
        return;
      }
      
      if (existingCommunity) {
        console.log(`[BOT-STATUS] 🔄 Updating existing community with ID ${existingCommunity.id}`);
        
        // Update the community status to active
        const { error: updateError } = await supabase
          .from('communities')
          .update({
            is_active: true,
            bot_status: newStatus,
            updated_at: new Date().toISOString()
          })
          .eq('id', existingCommunity.id);
        
        if (updateError) {
          console.error('[BOT-STATUS] ❌ Error updating community status:', updateError);
        } else {
          console.log('[BOT-STATUS] ✅ Community status updated successfully');
        }
      } else if (['group', 'supergroup', 'channel'].includes(chatType)) {
        console.log('[BOT-STATUS] ➕ Creating new community record');
        
        // Create a new community record
        const chatName = update.chat.title || `Chat ${chatId}`;
        const { error: createError } = await supabase
          .from('communities')
          .insert({
            telegram_chat_id: chatId,
            name: chatName,
            chat_type: chatType,
            is_active: true,
            bot_status: newStatus,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });
        
        if (createError) {
          console.error('[BOT-STATUS] ❌ Error creating community record:', createError);
        } else {
          console.log('[BOT-STATUS] ✅ Community record created successfully');
        }
      }
    }
    
    // Handle bot being removed from a chat
    else if (newStatus === 'left' && ['member', 'administrator'].includes(oldStatus)) {
      console.log(`[BOT-STATUS] ❌ Bot was removed from ${chatType} ${chatId}`);
      
      // Update the community status to inactive
      const { error: updateError } = await supabase
        .from('communities')
        .update({
          is_active: false,
          bot_status: 'left',
          updated_at: new Date().toISOString()
        })
        .eq('telegram_chat_id', chatId);
      
      if (updateError) {
        console.error('[BOT-STATUS] ❌ Error updating community status:', updateError);
      } else {
        console.log('[BOT-STATUS] ✅ Community status updated to inactive');
      }
    }
    
    // Handle bot status changes (e.g. from member to administrator)
    else if (newStatus !== oldStatus) {
      console.log(`[BOT-STATUS] 🔄 Bot status changed from ${oldStatus} to ${newStatus} in ${chatType} ${chatId}`);
      
      // Update the bot status in the community record
      const { error: updateError } = await supabase
        .from('communities')
        .update({
          bot_status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('telegram_chat_id', chatId);
      
      if (updateError) {
        console.error('[BOT-STATUS] ❌ Error updating bot status:', updateError);
      } else {
        console.log('[BOT-STATUS] ✅ Bot status updated successfully');
      }
    }
    
    // Log the event
    await supabase
      .from('telegram_bot_status_logs')
      .insert({
        telegram_chat_id: chatId,
        old_status: oldStatus,
        new_status: newStatus,
        raw_data: update
      })
      .then(({ error }) => {
        if (error) {
          console.error('[BOT-STATUS] ❌ Error logging bot status change:', error);
        } else {
          console.log('[BOT-STATUS] 📝 Bot status change logged successfully');
        }
      });
      
  } catch (error) {
    console.error('[BOT-STATUS] ❌ Error handling my_chat_member update:', error);
  }
}
