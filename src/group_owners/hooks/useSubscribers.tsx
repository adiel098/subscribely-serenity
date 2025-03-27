
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface Plan {
  id: string;
  name: string;
  price: number;
  interval: string;
  features?: string[];
}

export interface Subscriber {
  id: string;
  first_name: string;
  last_name?: string;
  telegram_username?: string;
  photo_url?: string;
  subscription_status: string;
  subscription_end_date?: string;
  joined_at?: string;
  is_active?: boolean;
  is_trial?: boolean;
  trial_end_date?: string;
  telegram_user_id?: string;
  subscription_plan_id?: string;
  subscription_start_date?: string;
  last_active?: string;
  last_checked?: string;
  community_id?: string;
  plan?: Plan;
  is_blocked?: boolean;
}

export const useSubscribers = (communityId: string) => {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['subscribers', communityId],
    queryFn: async () => {
      if (!communityId) return [];
      
      const { data, error } = await supabase
        .from('community_subscribers')
        .select('*')
        .eq('community_id', communityId)
        .order('joined_at', { ascending: false });
        
      if (error) {
        console.error('Error fetching subscribers:', error);
        throw error;
      }
      
      return data as Subscriber[];
    },
    enabled: !!communityId
  });
  
  return {
    subscribers: data || [],
    isLoading,
    error,
    refetch
  };
};
