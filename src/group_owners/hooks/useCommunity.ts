
import { useQuery } from "@tanstack/react-query";
import { Community } from "./useCommunities";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/auth/contexts/AuthContext";

export const useCommunity = (communityId?: string) => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ["community", communityId],
    queryFn: async (): Promise<Community | null> => {
      if (!communityId || !user) return null;
      
      const { data, error } = await supabase
        .from("communities")
        .select("*")
        .eq("id", communityId)
        .eq("owner_id", user.id)
        .single();
      
      if (error) {
        console.error("Error fetching community:", error);
        throw new Error(error.message);
      }
      
      return data as Community;
    },
    enabled: !!communityId && !!user,
  });
};
