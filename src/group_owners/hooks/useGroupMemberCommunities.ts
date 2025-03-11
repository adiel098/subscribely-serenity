
import { useMemo } from "react";
import { useCommunityGroupMembers } from "./useCommunityGroupMembers";
import { useCommunities } from "./useCommunities";
import { Community } from "./useCommunities";

export const useGroupMemberCommunities = (groupId: string | null) => {
  const { data: groupMembers, isLoading: membersLoading } = useCommunityGroupMembers(groupId);
  const { data: allCommunities, isLoading: communitiesLoading } = useCommunities();
  
  const memberCommunities = useMemo(() => {
    if (!groupMembers || !allCommunities) return [];
    
    // Get list of community IDs in this group
    const communityIds = groupMembers.map(member => member.community_id);
    
    // Find the actual community objects
    return allCommunities
      .filter(community => communityIds.includes(community.id))
      .sort((a, b) => {
        // Sort by the display order in the group
        const aIndex = groupMembers.findIndex(m => m.community_id === a.id);
        const bIndex = groupMembers.findIndex(m => m.community_id === b.id);
        return aIndex - bIndex;
      });
  }, [groupMembers, allCommunities]);
  
  const isLoading = membersLoading || communitiesLoading;
  
  return {
    communities: memberCommunities as Community[],
    isLoading,
    communityIds: groupMembers?.map(m => m.community_id) || []
  };
};
