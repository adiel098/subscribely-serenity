
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.7";

/**
 * Fetches community by ID
 */
export const getCommunityById = async (supabase: ReturnType<typeof createClient>, communityId: string) => {
  console.log(`Fetching community: ${communityId}`);
  
  const { data: community, error } = await supabase
    .from('communities')
    .select('id, name, telegram_chat_id, telegram_invite_link, is_group')
    .eq('id', communityId)
    .maybeSingle();
  
  if (error) {
    console.error(`Error fetching community ${communityId}:`, error);
    throw new Error(`Database error: ${error.message}`);
  }
  
  if (!community) {
    console.error(`Community not found: ${communityId}`);
    throw new Error(`Community not found with ID: ${communityId}`);
  }
  
  return community;
};

/**
 * Updates the community's invite link
 */
export const updateCommunityInviteLink = async (
  supabase: ReturnType<typeof createClient>, 
  communityId: string, 
  inviteLink: string
) => {
  console.log(`Updating community ${communityId} with invite link: ${inviteLink}`);
  
  const { error } = await supabase
    .from('communities')
    .update({ telegram_invite_link: inviteLink })
    .eq('id', communityId);
  
  if (error) {
    console.error(`Error updating community ${communityId} with invite link:`, error);
    throw new Error(`Database error: ${error.message}`);
  }
  
  console.log(`Successfully updated community ${communityId} with invite link`);
};

/**
 * Gets all channel communities for a group
 */
export const getGroupChannels = async (supabase: ReturnType<typeof createClient>, groupId: string) => {
  console.log(`Fetching channels for group: ${groupId}`);
  
  const { data: relationships, error: relError } = await supabase
    .from('community_relationships')
    .select('community_id')
    .eq('member_id', groupId)
    .eq('relationship_type', 'group');
  
  if (relError) {
    console.error(`Error fetching relationships for group ${groupId}:`, relError);
    throw new Error(`Database error: ${relError.message}`);
  }
  
  if (!relationships || relationships.length === 0) {
    console.log(`No channels found for group ${groupId}`);
    return [];
  }
  
  const communityIds = relationships.map(rel => rel.community_id);
  console.log(`Found ${communityIds.length} channel IDs for group ${groupId}`);
  
  const { data: channels, error: channelsError } = await supabase
    .from('communities')
    .select('id, name, telegram_invite_link, telegram_chat_id')
    .in('id', communityIds);
  
  if (channelsError) {
    console.error(`Error fetching channel communities:`, channelsError);
    throw new Error(`Database error: ${channelsError.message}`);
  }
  
  console.log(`Successfully fetched ${channels?.length || 0} channels for group ${groupId}`);
  return channels || [];
};
