
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../../cors.ts';
import { handleChatMemberUpdate } from '../memberUpdateHandler.ts';
import { handleMyChatMember } from '../botStatusHandler.ts';
import { createLogger } from '../../services/loggingService.ts';

export async function handleMemberRoute(
  supabase: ReturnType<typeof createClient>,
  chatMember: any,
  botToken: string
) {
  const logger = createLogger(supabase, 'MEMBER-ROUTER');
  
  try {
    await logger.info(`🔄 Processing chat member update for ${chatMember.from?.id || 'unknown'}`);
    
    // Check if this is a chat member update
    if (chatMember.chat && chatMember.from && chatMember.new_chat_member && chatMember.old_chat_member) {
      await logger.info(`📝 Chat ID: ${chatMember.chat.id}, User ID: ${chatMember.from.id}`);
      await logger.info(`📝 Old status: ${chatMember.old_chat_member.status}, New status: ${chatMember.new_chat_member.status}`);
      
      // Update member activity timestamp
      try {
        await supabase
          .from('telegram_activity_logs')
          .insert({
            telegram_user_id: chatMember.from.id.toString(),
            telegram_username: chatMember.from.username,
            activity_type: 'member_update',
            details: `Status changed from ${chatMember.old_chat_member.status} to ${chatMember.new_chat_member.status}`,
            chat_id: chatMember.chat.id.toString()
          });
      } catch (error) {
        await logger.error(`❌ Error logging activity:`, error);
      }
      
      // Handle the chat member update
      const result = await handleChatMemberUpdate(supabase, chatMember);
      
      await logger.info(`✅ Chat member update processed: ${result ? 'Handled' : 'Not handled'}`);
      
      return {
        handled: true,
        response: null
      };
    } else {
      await logger.warn(`⚠️ Invalid chat member update format`);
      return {
        handled: false,
        response: null
      };
    }
  } catch (error) {
    await logger.error(`❌ Error handling chat member update:`, error);
    
    return {
      handled: false,
      response: new Response(
        JSON.stringify({ 
          success: false, 
          error: error.message || "Unknown error in member handler"
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      )
    };
  }
}

export async function handleMyChatMemberRoute(
  supabase: ReturnType<typeof createClient>,
  myChatMember: any,
  botToken: string
) {
  const logger = createLogger(supabase, 'MY-MEMBER-ROUTER');
  
  try {
    await logger.info(`🔄 Processing my_chat_member update for ${myChatMember.chat?.id || 'unknown'}`);
    
    if (myChatMember.chat && myChatMember.from && myChatMember.new_chat_member && myChatMember.old_chat_member) {
      await logger.info(`📝 Chat ID: ${myChatMember.chat.id}, User ID: ${myChatMember.from.id}`);
      await logger.info(`📝 Old status: ${myChatMember.old_chat_member.status}, New status: ${myChatMember.new_chat_member.status}`);
      
      // Handle the bot status update
      const result = await handleMyChatMember(supabase, myChatMember, botToken);
      
      await logger.info(`✅ Bot status update processed: ${result ? 'Handled' : 'Not handled'}`);
      
      return {
        handled: true,
        response: null
      };
    } else {
      await logger.warn(`⚠️ Invalid my_chat_member update format`);
      return {
        handled: false,
        response: null
      };
    }
  } catch (error) {
    await logger.error(`❌ Error handling my_chat_member update:`, error);
    
    return {
      handled: false,
      response: new Response(
        JSON.stringify({ 
          success: false, 
          error: error.message || "Unknown error in my_chat_member handler"
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      )
    };
  }
}
