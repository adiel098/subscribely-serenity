
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { handleChatMemberUpdate } from '../../handlers/memberUpdateHandler.ts';
import { handleMyChatMember } from '../../handlers/botStatusHandler.ts';
import { corsHeaders } from '../../cors.ts';

/**
 * Handler for member-related events from Telegram webhook
 */
export async function handleMemberRoute(
  supabase: ReturnType<typeof createClient>,
  update: any,
  botToken: string
): Promise<{ handled: boolean, response?: Response }> {
  // Route: Chat Member Updates
  if (update.chat_member) {
    console.log('[MEMBER-ROUTE] 👥 Routing to chat member update handler');
    await handleChatMemberUpdate(supabase, update.chat_member);
    
    return { 
      handled: true,
      response: new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    };
  }
  
  // Route: My Chat Member Updates (when bot status changes)
  if (update.my_chat_member) {
    console.log('[MEMBER-ROUTE] 🤖 Routing to my chat member update handler');
    await handleMyChatMember(supabase, update.my_chat_member, botToken);
    
    return { 
      handled: true,
      response: new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    };
  }
  
  return { handled: false };
}
