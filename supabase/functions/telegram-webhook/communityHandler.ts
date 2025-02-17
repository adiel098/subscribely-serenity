
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

export async function findCommunityById(supabase: ReturnType<typeof createClient>, communityId: string) {
  try {
    const { data: community, error } = await supabase
      .from('communities')
      .select('*')
      .eq('id', communityId)
      .single();

    if (error) {
      console.error('Error fetching community:', error);
      throw error;
    }

    return community;
  } catch (error) {
    console.error('Error in findCommunityById:', error);
    throw error;
  }
}
