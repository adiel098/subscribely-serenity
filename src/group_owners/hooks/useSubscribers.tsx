
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useEffect } from "react";

export interface Subscriber {
  id: string;
  telegram_user_id: string;
  telegram_username: string | null;
  joined_at: string;
  last_active: string | null;
  subscription_start_date: string | null;
  subscription_end_date: string | null;
  subscription_status: boolean;
  is_active: boolean | null; // Added this property
  total_messages: number | null;
  community_id: string;
  plan: {
    id: string;
    name: string;
    interval: string;
    price: number;
  } | null;
}

export const useSubscribers = (communityId: string) => {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['subscribers', communityId],
    queryFn: async () => {
      if (!communityId) return [];

      const { data, error } = await supabase
        .from('telegram_chat_members')
        .select(`
          *,
          telegram_bot_settings!inner(community_id),
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

      console.log('Fetched subscribers:', data);
      return data as Subscriber[];
    },
    enabled: Boolean(communityId),
  });

  useEffect(() => {
    if (communityId) {
      const checkStatus = async () => {
        try {
          const { error } = await supabase.functions.invoke('telegram-webhook', {
            body: { 
              communityId,
              path: '/update-activity'
            }
          });

          if (error) throw error;
          
          await refetch();
        } catch (error) {
          console.error('Error checking member status:', error);
        }
      };

      checkStatus();
    }
  }, [communityId]);

  return { data, isLoading, error, refetch };
};

