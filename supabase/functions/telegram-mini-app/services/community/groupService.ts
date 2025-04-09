
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.7";

/**
 * Process group member communities
 */
export async function processGroupCommunities(
  supabase: ReturnType<typeof createClient>,
  communityData
) {
  // Extract communities but don't rely on community_relationships
  let groupCommunities = [];
  
  if (communityData.project_id) {
    // Get communities belonging to this project instead
    try {
      const { data: projectCommunities, error } = await supabase
        .from("communities")
        .select("*")
        .eq("project_id", communityData.project_id);
      
      if (!error && projectCommunities) {
        groupCommunities = projectCommunities;
        console.log(`📝 Project has ${groupCommunities.length} communities`);
      }
    } catch (err) {
      console.error(`❌ Error fetching project communities: ${err.message}`);
    }
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
    // Directly query communities by project_id instead of using relationships table
    const { data: communities, error } = await supabase
      .from("communities")
      .select(`
        id, 
        name,
        description,
        telegram_photo_url,
        telegram_chat_id,
        custom_link
      `)
      .eq("project_id", groupId);
    
    if (error) {
      console.error(`❌ Error fetching group communities: ${error.message}`);
      return [];
    } else {
      console.log(`✅ Group has ${communities?.length || 0} communities`);
      return communities || [];
    }
  } catch (error) {
    console.error(`❌ Unexpected error fetching group communities: ${error.message}`);
    return [];
  }
}
