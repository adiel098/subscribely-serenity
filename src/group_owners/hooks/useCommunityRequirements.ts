
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useCommunityRequirements = () => {
  return useQuery({
    queryKey: ["community-requirements"],
    queryFn: async () => {
      // Fetch requirements from the server
      const { data, error } = await supabase
        .from('community_requirements')
        .select('*')
        .order('priority', { ascending: true });
      
      if (error) throw error;
      
      return data || [];
    }
  });
};
