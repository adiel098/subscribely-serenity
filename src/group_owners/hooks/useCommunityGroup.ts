
import { useQuery } from "@tanstack/react-query";
import { CommunityGroup } from "./types/communityGroup.types";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/auth/contexts/AuthContext";

export const useCommunityGroup = (groupId: string) => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ["community-group", groupId],
    queryFn: async (): Promise<CommunityGroup | null> => {
      if (!groupId || !user) return null;
      
      const { data, error } = await supabase
        .from("community_groups")
        .select("*")
        .eq("id", groupId)
        .eq("owner_id", user.id)
        .single();
      
      if (error) {
        console.error("Error fetching community group:", error);
        throw new Error(error.message);
      }
      
      return data as CommunityGroup;
    },
    enabled: !!groupId && !!user,
  });
};
