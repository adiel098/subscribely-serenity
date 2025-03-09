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

export async function findCommunityByCustomLink(supabase: ReturnType<typeof createClient>, customLink: string) {
  try {
    const { data: community, error } = await supabase
      .from('communities')
      .select('*')
      .eq('custom_link', customLink)
      .single();

    if (error) {
      console.error('Error fetching community by custom link:', error);
      return null;
    }

    return community;
  } catch (error) {
    console.error('Error in findCommunityByCustomLink:', error);
    return null;
  }
}

export async function findCommunityByIdOrLink(supabase: ReturnType<typeof createClient>, idOrLink: string) {
  // Check if it's a UUID first
  const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(idOrLink);
  
  if (isUUID) {
    return findCommunityById(supabase, idOrLink);
  }
  
  // Otherwise, try to find by custom link
  return findCommunityByCustomLink(supabase, idOrLink);
}
