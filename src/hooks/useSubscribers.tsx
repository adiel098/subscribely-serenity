
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface Subscriber {
  id: string;
  telegram_user_id: string;
  telegram_username: string | null;
  joined_at: string;
  last_active: string | null;
  subscription_start_date: string | null;
  subscription_end_date: string | null;
  subscription_status: boolean;
  plan: {
    id: string;
    name: string;
    interval: string;
    price: number;
  } | null;
}

export const useSubscribers = (communityId: string) => {
  return useQuery({
    queryKey: ['subscribers', communityId],
    queryFn: async () => {
      if (!communityId) return [];

      const { data, error } = await supabase
        .from('telegram_chat_members')
        .select(`
          *,
          plan:subscription_plans(
            id,
            name,
            interval,
            price
          )
        `)
        .eq('community_id', communityId)
        .order('joined_at', { ascending: false });

      if (error) {
        console.error('Error fetching subscribers:', error);
        throw error;
      }

      return data as Subscriber[];
    },
    enabled: Boolean(communityId),
  });
};
