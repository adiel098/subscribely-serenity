
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useCommunities = () => {
  return useQuery({
    queryKey: ["communities"],
    queryFn: async () => {
      const { data: communities, error } = await supabase
        .from("communities")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return communities;
    }
  });
};
