
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export const useCommunities = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["communities", user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data: communities, error } = await supabase
        .from("communities")
        .select("*")
        .eq("owner_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return communities;
    },
    enabled: !!user
  });
};
