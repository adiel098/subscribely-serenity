
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
  payment_status?: string;
  metadata?: {
    mini_app_accessed?: boolean;
    [key: string]: any;
  };
}

export const useSubscribers = (communityId: string) => {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['subscribers', communityId],
    queryFn: async () => {
      if (!communityId) return [];
      
      // Updated query to join with the subscription_plans table
      const { data, error } = await supabase
        .from('community_subscribers')
        .select(`
          *,
          plan:subscription_plans(
            id,
            name,
            price,
            interval,
            features
          )
        `)
        .eq('community_id', communityId)
        .order('joined_at', { ascending: false });
        
      if (error) {
        console.error('Error fetching subscribers:', error);
        throw error;
      }
      
      // Process the data to format the plan property correctly
      const processedData = data.map(subscriber => {
        // Handle the nested plan data from the join
        const plan = subscriber.plan && subscriber.plan.length > 0 
          ? subscriber.plan[0] 
          : undefined;
        
        return {
          ...subscriber,
          plan: plan
        };
      });
      
      return processedData as Subscriber[];
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
