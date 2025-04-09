
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/auth/contexts/AuthContext";
import { CommunityGroup } from "./types/communityGroup.types";
import { toast } from "sonner";

export const useCommunityGroups = () => {
  const { user } = useAuth();

  const query = useQuery({
    queryKey: ["community-groups", user?.id],
    queryFn: async () => {
      if (!user) {
        console.log("No user found, returning empty array");
        return [];
      }
      
      console.log("Fetching community groups for user:", user.id);
      
      try {
        // Instead of filtering on is_group column which doesn't exist anymore, 
        // we'll query community_relationships table to find groups
        const { data: groups, error } = await supabase
          .from("community_relationships")
          .select(`
            community_id,
            communities:community_id (
              id, name, description, owner_id, telegram_photo_url, 
              telegram_chat_id, custom_link, created_at, updated_at
            )
          `)
          .eq("relationship_type", "group")
          .eq("owner_id", user.id);

        if (error) {
          console.error("Error fetching community groups:", error);
          toast.error("Failed to fetch community groups");
          throw error;
        }

        // Transform the data to match the expected format
        const formattedGroups = groups
          .filter(group => group.communities)
          .map(group => ({
            ...group.communities,
            is_group: true // Add this property even though it's not in DB
          }));

        console.log("Successfully fetched community groups:", formattedGroups);
        return formattedGroups as CommunityGroup[];
      } catch (error) {
        console.error("Error in community groups query:", error);
        toast.error("An error occurred while fetching community groups");
        return [];
      }
    },
    enabled: !!user,
    retry: 2,
    staleTime: 0,
    refetchOnWindowFocus: true
  });

  return query;
};
