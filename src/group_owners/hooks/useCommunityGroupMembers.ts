
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { CommunityGroupMember } from "./types/communityGroup.types";
import { toast } from "sonner";

export const useCommunityGroupMembers = (groupId: string | null) => {
  const query = useQuery({
    queryKey: ["community-group-members", groupId],
    queryFn: async () => {
      if (!groupId) {
        console.log("No group ID provided, returning empty array");
        return [];
      }
      
      console.log("Fetching community group members for group:", groupId);
      
      try {
        const { data: members, error } = await supabase
          .from("community_group_members")
          .select("*")
          .eq("group_id", groupId)
          .order("display_order", { ascending: true });

        if (error) {
          console.error("Error fetching community group members:", error);
          toast.error("Failed to fetch community group members");
          throw error;
        }

        console.log("Successfully fetched community group members:", members);
        return members as CommunityGroupMember[];
      } catch (error) {
        console.error("Error in community group members query:", error);
        toast.error("An error occurred while fetching community group members");
        return [];
      }
    },
    enabled: !!groupId,
    retry: 2,
    staleTime: 0,
    refetchOnWindowFocus: true
  });

  return query;
};
