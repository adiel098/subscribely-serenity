
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/auth/contexts/AuthContext";
import { toast } from "sonner";

export interface Community {
  id: string;
  name: string;
  description: string | null;
  owner_id: string;
  telegram_chat_id: string | null;
  telegram_photo_url: string | null;
  telegram_username: string | null;
  custom_link: string | null;
  photo_url: string | null;
  profile_photo_url?: string | null;
  created_at: string;
  updated_at: string;
  is_group: boolean; // We'll add this property manually
  member_count?: number;
  subscription_count?: number;
}

export const useCommunities = () => {
  const { user } = useAuth();

  const query = useQuery({
    queryKey: ["communities", user?.id],
    queryFn: async () => {
      if (!user) {
        console.log("No user found");
        return [];
      }
      
      try {
        // Get all communities owned by this user
        const { data: communities, error } = await supabase
          .from("communities")
          .select("*")
          .eq("owner_id", user.id)
          .order("created_at", { ascending: false });

        if (error) {
          console.error("Error fetching communities:", error);
          toast.error("Failed to fetch communities");
          throw error;
        }

        // Now, get community_relationships to determine which are groups
        const { data: relationships, error: relError } = await supabase
          .from("community_relationships")
          .select("community_id")
          .eq("relationship_type", "group")
          .eq("owner_id", user.id);

        if (relError) {
          console.error("Error fetching relationships:", relError);
        }

        // Create a set of group community IDs for efficient lookup
        const groupIds = new Set(relationships?.map(r => r.community_id) || []);
        
        // Annotate communities with is_group property
        const processedCommunities = communities.map(community => ({
          ...community,
          is_group: groupIds.has(community.id)
        }));

        return processedCommunities as Community[];
      } catch (error) {
        console.error("Error fetching communities:", error);
        toast.error("An error occurred while fetching communities");
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
