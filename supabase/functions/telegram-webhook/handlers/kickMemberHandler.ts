
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { kickMemberService } from './services/memberKickService.ts';

// Re-exporting from the new modular files for backward compatibility
export async function kickMember(
  supabase: ReturnType<typeof createClient>,
  chatId: string,
  userId: string,
  botToken: string
) {
  return await kickMemberService(supabase, chatId, userId, botToken);
}
