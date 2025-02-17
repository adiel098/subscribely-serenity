
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface Community {
  id: string;
  name: string;
  owner_id: string;
  platform: string;
  platform_id: string | null;
  telegram_chat_id: string | null;
  telegram_invite_link: string | null;
  member_count: number;
  subscription_count: number;
  subscription_revenue: number;
  created_at: string;
  updated_at: string;
}

export const useCommunities = () => {
  return useQuery({
    queryKey: ["communities"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("communities")
        .select("*");

      if (error) {
        throw error;
      }

      return data as Community[];
    },
  });
};
