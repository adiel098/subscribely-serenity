
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useCommunities } from "./useCommunities";

export const useGroupMemberCommunities = (groupId: string | null) => {
  const [communityIds, setCommunityIds] = useState<string[]>([]);
  const [communities, setCommunities] = useState<any[]>([]);
  
  // Fetch the member IDs for the group
  const { data: members, isLoading: membersLoading } = useQuery({
    queryKey: ["group-member-communities", groupId],
    queryFn: async () => {
      if (!groupId) {
        console.log("No group ID provided, returning empty array");
        return [];
      }
      
      try {
        const { data: groupMembers, error } = await supabase
          .from("community_group_members")
          .select("*")
          .eq("parent_id", groupId)
          .order("display_order", { ascending: true });

        if (error) {
          console.error("Error fetching community group members:", error);
          throw error;
        }

        return groupMembers || [];
      } catch (error) {
        console.error("Error in community group members query:", error);
        return [];
      }
    },
    enabled: !!groupId
  });
  
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
