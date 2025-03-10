
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { handleStartCommand as handleStartCommandImpl } from './startCommandHandler.ts';

/**
 * Handle the /start command by forwarding to the main implementation
 */
export async function handleStartCommand(
  supabase: ReturnType<typeof createClient>, 
  message: any, 
  botToken: string
) {
  console.log('[COMMAND-HANDLER] 🚀 Forwarding /start command to implementation');
  return await handleStartCommandImpl(supabase, message, botToken);
}
