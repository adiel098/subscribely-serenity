
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { CommunityRelationship } from "./types/communityGroup.types";
import { toast } from "sonner";

export const useCommunityGroupMembers = (groupId: string | null) => {
  const query = useQuery({
    queryKey: ["community-group-members", groupId],
    queryFn: async () => {
      if (!groupId) {
        return [];
      }
      
      try {
        const { data, error } = await supabase
          .from("community_relationships")
          .select("*")
          .eq("community_id", groupId);
          
        if (error) {
          console.error("Error fetching community group members:", error);
          toast.error("Failed to fetch community group members");
          throw error;
        }
        
        return data as CommunityRelationship[];
      } catch (error) {
        console.error("Error in community group members query:", error);
        toast.error("An error occurred while fetching community group members");
        return [];
      }
    },
    enabled: !!groupId
  });
  
  return query;
};
