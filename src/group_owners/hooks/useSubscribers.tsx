
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabaseClient";

export interface Plan {
  id: string;
  name: string;
  price: number;
  interval: string;
  features?: string[];
}

export interface Subscriber {
  id: string;
  first_name: string | null;
  last_name?: string | null;
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
  project_id?: string;  // Add project_id to fix the error
  plan?: Plan | null;
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
      
      console.log("Fetching subscribers for community:", communityId);
      
      // Updated query to use project_subscribers table instead of community_subscribers
      const { data, error } = await supabase
        .from('project_subscribers')
        .select(`
          *,
          plan:subscription_plan_id (
            id,
            name,
            price,
            interval,
            features
          )
        `)
        .eq('project_id', communityId)
        .order('joined_at', { ascending: false });
        
      if (error) {
        console.error('Error fetching subscribers:', error);
        throw error;
      }
      
      console.log("Raw subscriber data:", data);
      
      // Get user names from telegram_mini_app_users if available
      const userTelegramIds = data.map(subscriber => subscriber.telegram_user_id);
      
      const { data: telegramUsers, error: telegramError } = await supabase
        .from('telegram_mini_app_users')
        .select('telegram_id, first_name, last_name')
        .in('telegram_id', userTelegramIds);
      
      if (telegramError) {
        console.error('Error fetching telegram users:', telegramError);
      }
      
      // Create a map of telegram_id to user details
      const userMap: Record<string, { first_name: string | null, last_name: string | null }> = {};
      
      if (telegramUsers && telegramUsers.length > 0) {
        telegramUsers.forEach(user => {
          userMap[user.telegram_id] = {
            first_name: user.first_name,
            last_name: user.last_name
          };
        });
      }
      
      // Process plan data
      const processedData = data.map(subscriber => {
        // Handle plan data
        let plan = null;
        
        // Handle case where plan is returned as an array
        if (subscriber.plan && Array.isArray(subscriber.plan) && subscriber.plan.length > 0) {
          plan = subscriber.plan[0];
        } 
        // Handle case where plan is returned as an object
        else if (subscriber.plan && typeof subscriber.plan === 'object' && !Array.isArray(subscriber.plan)) {
          plan = subscriber.plan;
        }
        
        if (!plan && subscriber.subscription_plan_id) {
          console.log(`Subscriber ${subscriber.id} has subscription_plan_id ${subscriber.subscription_plan_id} but no plan data`);
        }
        
        // Add the user details from telegram_mini_app_users if available
        const userDetails = userMap[subscriber.telegram_user_id] || { first_name: null, last_name: null };
        
        // Make sure subscription_status is always a string value
        const status = typeof subscriber.subscription_status === 'string' 
          ? subscriber.subscription_status 
          : subscriber.subscription_status === true 
            ? 'active' 
            : 'inactive';
            
        return {
          ...subscriber,
          subscription_status: status,
          plan,
          first_name: userDetails.first_name,
          last_name: userDetails.last_name
        };
      });
      
      console.log("Processed subscriber data:", processedData);
      
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
