
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { handleChatJoinRequest } from '../../handlers/services/joinRequestHandler.ts';

/**
 * Handler for chat join request events from Telegram webhook
 */
export async function handleJoinRequestRoute(
  supabase: ReturnType<typeof createClient>,
  update: any
): Promise<{ handled: boolean, response?: Response }> {
  if (update.chat_join_request) {
    console.log("[JOIN-REQUEST-ROUTE] 🔄 Routing to chat join request handler");
    const response = await handleChatJoinRequest(supabase, update);
    return { handled: true, response };
  }
  
  return { handled: false };
}
