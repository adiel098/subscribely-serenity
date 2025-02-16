
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

export async function findCommunityByTelegramId(supabase: ReturnType<typeof createClient>, chatId: string | number) {
  const { data: community, error: communityError } = await supabase
    .from('communities')
    .select('*')
    .eq('telegram_chat_id', chatId.toString())
    .single();
    
  if (communityError) {
    console.error('Error finding community:', communityError);
    throw communityError;
  }
  
  if (!community) {
    console.error('Community not found for chat_id:', chatId);
    throw new Error(`Community not found for chat_id: ${chatId}`);
  }
  
  return community;
}

export async function findCommunityById(supabase: ReturnType<typeof createClient>, communityId: string) {
  const { data: community, error: communityError } = await supabase
    .from('communities')
    .select('*')
    .eq('id', communityId)
    .single();

  if (communityError || !community) {
    console.error('Error finding community:', communityError);
    throw communityError;
  }

  return community;
}
