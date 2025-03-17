
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.7";

/**
 * Process group member communities
 */
export async function processGroupCommunities(
  supabase: ReturnType<typeof createClient>,
  communityData
) {
  // Extract communities from relationships
  let groupCommunities = [];
  
  if (communityData.community_relationships && Array.isArray(communityData.community_relationships)) {
    groupCommunities = communityData.community_relationships
      .map(rel => rel.communities)
      .filter(Boolean);
    console.log(`📝 Group has ${groupCommunities.length} communities`);
  }
  
  return groupCommunities;
}

/**
 * Fetch member communities for a group
 */
export async function fetchGroupMemberCommunities(
  supabase: ReturnType<typeof createClient>,
  groupId: string
) {
  try {
    const { data: relationships, error: relationshipsError } = await supabase
      .from("community_relationships")
      .select(`
        member_id,
        communities:member_id (
          id, 
          name,
          description,
          telegram_photo_url,
          telegram_chat_id,
          custom_link
        )
      `)
      .eq("community_id", groupId)
      .eq("relationship_type", "group");
    
    if (relationshipsError) {
      console.error(`❌ Error fetching group relationships: ${relationshipsError.message}`);
      return [];
    } else {
      // Process the communities within the group
      const memberCommunities = relationships
        ?.map(item => item.communities)
        .filter(Boolean) || [];
      
      console.log(`✅ Group has ${memberCommunities.length} communities`);
      return memberCommunities;
    }
  } catch (relError) {
    console.error(`❌ Unexpected error fetching group relationships: ${relError.message}`);
    return [];
  }
}
