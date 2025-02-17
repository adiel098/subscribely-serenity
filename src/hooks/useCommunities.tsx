import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export interface Community {
  id: string;
  name: string;
  owner_id: string;
  created_at: string;
  updated_at: string;
  platform_id: string;
  member_count: number;
  subscription_count: number;
  subscription_revenue: number;
  description: string | null;
  platform: 'telegram' | 'discord';
  telegram_chat_id: string | null;
  telegram_invite_link: string | null;
  telegram_photo_url: string | null;
  subscription_plans: Array<{
    id: string;
    name: string;
    description: string | null;
    price: number;
    interval: string;
    features: string[];
  }>;
}

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
          .select("*")
          .eq("owner_id", user.id)
          .order("created_at", { ascending: false });

        if (error) {
          console.error("Error fetching communities:", error);
          toast.error("Failed to fetch communities");
          throw error;
        }

        console.log("Successfully fetched communities:", communities);
        return communities as Community[];
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
