
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.7";

/**
 * Fetches a community by ID
 */
export const getCommunityById = async (
  supabase: ReturnType<typeof createClient>, 
  communityId: string
) => {
  const { data: community, error: communityError } = await supabase
    .from('communities')
    .select('id, name, is_group, telegram_invite_link, telegram_chat_id')
    .eq('id', communityId)
    .single();
  
  if (communityError) {
    console.error("Error fetching community:", communityError);
    throw new Error("Failed to fetch community");
  }
  
  return community;
};

/**
 * Updates a community's invite link
 */
export const updateCommunityInviteLink = async (
  supabase: ReturnType<typeof createClient>,
  communityId: string,
  inviteLink: string
) => {
  const { error: updateError } = await supabase
    .from('communities')
    .update({ telegram_invite_link: inviteLink })
    .eq('id', communityId);
  
  if (updateError) {
    console.error("Error updating community:", updateError);
  }
  
  return !updateError;
};

/**
 * Fetches channel communities for a group
 */
export const getGroupChannels = async (
  supabase: ReturnType<typeof createClient>,
  groupId: string
) => {
  const { data: relationships, error: relsError } = await supabase
    .from('community_relationships')
    .select(`
      member_id,
      communities:member_id (
        id, 
        name,
        telegram_invite_link,
        telegram_photo_url
      )
    `)
    .eq('community_id', groupId)
    .eq('relationship_type', 'group');
  
  if (relsError) {
    console.error("Error fetching relationships:", relsError);
    return [];
  }
  
  // Extract channels with their invite links
  return relationships
    ?.map(rel => rel.communities)
    .filter(Boolean) || [];
};
