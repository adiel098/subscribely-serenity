
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
  created_at: string;
  updated_at: string;
  is_group: boolean;
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

        return communities as Community[];
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
