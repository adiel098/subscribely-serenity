import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

export async function findCommunityById(supabase: ReturnType<typeof createClient>, communityId: string) {
  try {
    console.log(`[COMMUNITY-HANDLER] 🔍 Looking up community by ID: ${communityId}`);
    const { data: community, error } = await supabase
      .from('communities')
      .select('*')
      .eq('id', communityId)
      .single();

    if (error) {
      console.error('[COMMUNITY-HANDLER] ❌ Error fetching community by ID:', error);
      throw error;
    }

    console.log(`[COMMUNITY-HANDLER] ✅ Found community by ID: ${community?.name || 'Unknown'}`);
    return community;
  } catch (error) {
    console.error('[COMMUNITY-HANDLER] ❌ Error in findCommunityById:', error);
    throw error;
  }
}

export async function findCommunityByCustomLink(supabase: ReturnType<typeof createClient>, customLink: string) {
  try {
    console.log(`[COMMUNITY-HANDLER] 🔍 Looking up community by custom link: ${customLink}`);
    const { data: community, error } = await supabase
      .from('communities')
      .select('*')
      .eq('custom_link', customLink)
      .single();

    if (error) {
      console.error('[COMMUNITY-HANDLER] ❌ Error fetching community by custom link:', error);
      return null;
    }

    if (community) {
      console.log(`[COMMUNITY-HANDLER] ✅ Found community by custom link: ${community.name}, ID: ${community.id}`);
    } else {
      console.log(`[COMMUNITY-HANDLER] ⚠️ No community found with custom link: ${customLink}`);
    }
    
    return community;
  } catch (error) {
    console.error('[COMMUNITY-HANDLER] ❌ Error in findCommunityByCustomLink:', error);
    return null;
  }
}

export async function findCommunityByIdOrLink(supabase: ReturnType<typeof createClient>, idOrLink: string) {
  // Check if it's a UUID first
  const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(idOrLink);
  
  console.log(`[COMMUNITY-HANDLER] 🔍 Checking if ${idOrLink} is UUID: ${isUUID}`);
  
  if (isUUID) {
    return findCommunityById(supabase, idOrLink);
  }
  
  // Otherwise, try to find by custom link
  console.log(`[COMMUNITY-HANDLER] 🔍 Looking up as custom link: ${idOrLink}`);
  return findCommunityByCustomLink(supabase, idOrLink);
}
