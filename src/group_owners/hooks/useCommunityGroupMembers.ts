
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { CommunityRelationship } from "./types/communityGroup.types";
import { toast } from "sonner";
import { createLogger } from "@/telegram-mini-app/utils/debugUtils";

const logger = createLogger("useCommunityGroupMembers");

export const useCommunityGroupMembers = (groupId: string | null) => {
  const query = useQuery({
    queryKey: ["community-group-members", groupId],
    queryFn: async () => {
      if (!groupId) {
        return [];
      }
      
      try {
        logger.log("Fetching group members for group ID:", groupId);
        
        // In community_relationships:
        // - community_id = the GROUP id
        // - member_id = the COMMUNITY id that belongs to the group
        const { data, error } = await supabase
          .from("community_relationships")
          .select("*")
          .eq("community_id", groupId) // Filter by GROUP ID to get member communities
          .eq("relationship_type", "group");
          
        if (error) {
          logger.error("Error fetching community group members:", error);
          toast.error("Failed to fetch community group members");
          throw error;
        }
        
        logger.log(`Found ${data?.length || 0} communities in group ${groupId}`);
        return data as CommunityRelationship[];
      } catch (error) {
        logger.error("Error in community group members query:", error);
        toast.error("An error occurred while fetching community group members");
        return [];
      }
    },
    enabled: !!groupId
  });
  
  return query;
};
