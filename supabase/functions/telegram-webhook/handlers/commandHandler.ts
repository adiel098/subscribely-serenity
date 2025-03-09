
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { findCommunityByIdOrLink } from '../communityHandler.ts';
import { handleStartCommand } from './startCommandHandler.ts';

// This is now just a wrapper that forwards to our main handler
export async function handleStartCommand(
  supabase: ReturnType<typeof createClient>, 
  message: any, 
  botToken: string
) {
  // Simply forward to the main implementation
  return await handleStartCommand(supabase, message, botToken);
}
