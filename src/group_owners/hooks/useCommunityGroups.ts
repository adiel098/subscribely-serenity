
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
        // Query community_relationships table to find groups
        const { data: relationships, error } = await supabase
          .from("community_relationships")
          .select(`
            community_id,
            member_id,
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

        // Transform the data to match the expected format with all required properties
        const formattedGroups = relationships
          .filter(rel => rel.communities) // Filter out any records without valid communities data
          .map(rel => {
            // Access the nested communities object directly
            const community = rel.communities as any;
            return {
              id: community.id,
              name: community.name,
              description: community.description,
              owner_id: community.owner_id,
              telegram_chat_id: community.telegram_chat_id,
              telegram_photo_url: community.telegram_photo_url,
              custom_link: community.custom_link,
              created_at: community.created_at,
              updated_at: community.updated_at,
              is_group: true // Add this virtual property
            };
          });

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
