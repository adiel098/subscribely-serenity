
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
        const { data: groups, error } = await supabase
          .from("communities")
          .select("*")
          .eq("owner_id", user.id)
          .eq("is_group", true)
          .order("created_at", { ascending: false });

        if (error) {
          console.error("Error fetching community groups:", error);
          toast.error("Failed to fetch community groups");
          throw error;
        }

        console.log("Successfully fetched community groups:", groups);
        return groups as CommunityGroup[];
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
