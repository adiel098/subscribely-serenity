
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { logTelegramEvent } from '../eventLogger.ts';

export async function handleChatJoinRequest(supabase: ReturnType<typeof createClient>, update: any) {
  try {
    console.log('👤 Processing chat join request:', JSON.stringify(update.chat_join_request, null, 2));
    await logTelegramEvent(supabase, 'chat_join_request', update);
  } catch (error) {
    console.error('Error in handleChatJoinRequest:', error);
    throw error;
  }
}
