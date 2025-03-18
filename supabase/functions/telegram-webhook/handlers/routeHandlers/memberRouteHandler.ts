import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../../cors.ts';
import { handleChatMemberUpdate } from '../memberUpdateHandler.ts';
import { handleMyChatMember } from '../botStatusHandler.ts';
import { updateMemberActivity } from '../utils/activityUtils.ts';
import { logWebhookEvent, logWebhookError } from '../../services/eventLoggingService.ts';

export async function handleMemberRoute(
  supabase: ReturnType<typeof createClient>,
  chatMember: any,
  botToken: string
) {
  console.log(`🔄 [MEMBER-ROUTER] Processing chat member update for ${chatMember.from?.id || 'unknown'}`);
  
  try {
    // Log the member update event
    await logWebhookEvent(supabase, { chat_member: chatMember }, chatMember, false);
    
    // Check if this is a bot status update (my_chat_member) or a regular member update
    if (chatMember.chat && chatMember.from && chatMember.new_chat_member && chatMember.old_chat_member) {
      console.log(`📝 [MEMBER-ROUTER] Chat ID: ${chatMember.chat.id}, User ID: ${chatMember.from.id}`);
      console.log(`📝 [MEMBER-ROUTER] Old status: ${chatMember.old_chat_member.status}, New status: ${chatMember.new_chat_member.status}`);
      
      // Update member activity timestamp
      await updateMemberActivity(
        supabase,
        chatMember.chat.id.toString(),
        chatMember.from.id.toString(),
        chatMember.from.username
      );
      
      // Handle the chat member update
      const result = await handleChatMemberUpdate(
        supabase,
        chatMember,
        botToken
      );
      
      console.log(`✅ [MEMBER-ROUTER] Chat member update processed: ${result ? 'Handled' : 'Not handled'}`);
      
      return {
        handled: true,
        response: null
      };
    } else {
      console.warn(`⚠️ [MEMBER-ROUTER] Invalid chat member update format`);
      return {
        handled: false,
        response: null
      };
    }
  } catch (error) {
    console.error(`❌ [MEMBER-ROUTER] Error handling chat member update:`, error);
    await logWebhookError(supabase, error, { chat_member: chatMember });
    
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
  console.log(`🔄 [MY-MEMBER-ROUTER] Processing my_chat_member update for ${myChatMember.chat?.id || 'unknown'}`);
  
  try {
    // Log the my_chat_member event
    await logWebhookEvent(supabase, { my_chat_member: myChatMember }, myChatMember, false);
    
    if (myChatMember.chat && myChatMember.from && myChatMember.new_chat_member && myChatMember.old_chat_member) {
      console.log(`📝 [MY-MEMBER-ROUTER] Chat ID: ${myChatMember.chat.id}, User ID: ${myChatMember.from.id}`);
      console.log(`📝 [MY-MEMBER-ROUTER] Old status: ${myChatMember.old_chat_member.status}, New status: ${myChatMember.new_chat_member.status}`);
      
      // Handle the bot status update
      const result = await handleMyChatMember(
        supabase,
        myChatMember,
        botToken
      );
      
      console.log(`✅ [MY-MEMBER-ROUTER] Bot status update processed: ${result ? 'Handled' : 'Not handled'}`);
      
      return {
        handled: true,
        response: null
      };
    } else {
      console.warn(`⚠️ [MY-MEMBER-ROUTER] Invalid my_chat_member update format`);
      return {
        handled: false,
        response: null
      };
    }
  } catch (error) {
    console.error(`❌ [MY-MEMBER-ROUTER] Error handling my_chat_member update:`, error);
    await logWebhookError(supabase, error, { my_chat_member: myChatMember });
    
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
