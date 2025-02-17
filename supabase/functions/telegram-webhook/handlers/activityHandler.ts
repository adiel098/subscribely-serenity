
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

export async function updateMemberActivity(
  supabase: ReturnType<typeof createClient>,
  userId: string,
  communityId: string
) {
  try {
    await supabase
      .from('telegram_chat_members')
      .update({
        last_active: new Date().toISOString(),
        total_messages: supabase.rpc('increment'),
      })
      .eq('telegram_user_id', userId)
      .eq('community_id', communityId);

    return true;
  } catch (error) {
    console.error('[Activity] Error updating member activity:', error);
    return false;
  }
}

export async function checkInactiveMembers(
  supabase: ReturnType<typeof createClient>,
  communityId: string,
  daysThreshold: number = 30
) {
  const { data: inactiveMembers } = await supabase
    .from('telegram_chat_members')
    .select('*')
    .eq('community_id', communityId)
    .eq('is_active', true)
    .lt('last_active', new Date(Date.now() - daysThreshold * 24 * 60 * 60 * 1000).toISOString());

  return inactiveMembers || [];
}
