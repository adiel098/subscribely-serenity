
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useCommunities } from "./useCommunities";

export const useGroupMemberCommunities = (groupId: string | null) => {
  const [communityIds, setCommunityIds] = useState<string[]>([]);
  const [communities, setCommunities] = useState<any[]>([]);
  
  // Fetch the member IDs for the group using the community_relationships table
  const { data: relationships, isLoading: relationshipsLoading } = useQuery({
    queryKey: ["group-member-communities", groupId],
    queryFn: async () => {
      if (!groupId) {
        console.log("No group ID provided, returning empty array");
        return [];
      }
      
      try {
        // Use the community_relationships table
        const { data: relationships, error } = await supabase
          .from("community_relationships")
          .select("*")
          .eq("community_id", groupId)
          .eq("relationship_type", "group")
          .order("display_order", { ascending: true });

        if (error) {
          console.error("Error fetching community relationships:", error);
          throw error;
        }

        console.log("Group relationships loaded:", relationships);
        return relationships || [];
      } catch (error) {
        console.error("Error in community relationships query:", error);
        return [];
      }
    },
    enabled: !!groupId
  });
  
  // Fetch all communities the user has access to
  const { data: allCommunities, isLoading: communitiesLoading } = useCommunities();
  
  // Extract community IDs from relationships when they load
  useEffect(() => {
    if (relationships && relationships.length > 0) {
      // Use member_id from community_relationships
      const ids = relationships.map(rel => rel.member_id);
      setCommunityIds(ids);
    } else {
      setCommunityIds([]);
    }
  }, [relationships]);
  
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
    isLoading: relationshipsLoading || communitiesLoading
  };
};
