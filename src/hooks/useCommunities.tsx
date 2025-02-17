
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Community } from "@/features/community/pages/TelegramMiniApp";

export const useCommunities = () => {
  const { user } = useAuth();

  const query = useQuery({
    queryKey: ["communities", user?.id],
    queryFn: async () => {
      if (!user) {
        console.log("No user found, returning empty array");
        return [];
      }
      
      console.log("Fetching communities for user:", user.id);
      
      try {
        const { data: communities, error } = await supabase
          .from("communities")
          .select(`
            *,
            subscription_plans (
              id,
              name,
              description,
              price,
              interval,
              features,
              community_id
            )
          `)
          .eq("owner_id", user.id)
          .order("created_at", { ascending: false });

        if (error) {
          console.error("Error fetching communities:", error);
          toast.error("Failed to fetch communities");
          throw error;
        }

        console.log("Successfully fetched communities:", communities);
        return communities as unknown as Community[];
      } catch (error) {
        console.error("Error in communities query:", error);
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
