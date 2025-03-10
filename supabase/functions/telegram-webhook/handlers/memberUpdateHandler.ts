
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { handleChatMemberUpdate as processChatMemberUpdate } from './chatMemberHandler.ts';

/**
 * Handler for chat member update events
 */
export async function handleChatMemberUpdate(supabase: ReturnType<typeof createClient>, update: any) {
  console.log('[MEMBER-UPDATE] 🔄 Processing chat member update event');
  return await processChatMemberUpdate(supabase, update);
}
