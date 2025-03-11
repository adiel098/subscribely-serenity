
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useCommunityGroupMembers } from "./useCommunityGroupMembers";
import { useCommunities } from "./useCommunities";

export const useGroupMemberCommunities = (groupId: string | null) => {
  const [communityIds, setCommunityIds] = useState<string[]>([]);
  const [communities, setCommunities] = useState<any[]>([]);
  
  // Fetch the member IDs for the group
  const { data: members, isLoading: membersLoading } = useCommunityGroupMembers(groupId);
  
  // Fetch all communities the user has access to
  const { data: allCommunities, isLoading: communitiesLoading } = useCommunities();
  
  // Extract community IDs from members when they load
  useEffect(() => {
    if (members && members.length > 0) {
      const ids = members.map(member => member.community_id);
      setCommunityIds(ids);
    } else {
      setCommunityIds([]);
    }
  }, [members]);
  
  // Filter communities based on the member IDs
  useEffect(() => {
    if (allCommunities && communityIds.length > 0) {
      const filteredCommunities = allCommunities.filter(community => 
        communityIds.includes(community.id)
      );
      setCommunities(filteredCommunities);
    } else {
      setCommunities([]);
    }
  }, [allCommunities, communityIds]);
  
  // Return the combined result
  return {
    communities,
    communityIds,
    isLoading: membersLoading || communitiesLoading
  };
};
