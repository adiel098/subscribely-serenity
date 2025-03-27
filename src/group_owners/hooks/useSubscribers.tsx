
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
      
      // שאילתה מעודכנת לחיבור עם טבלת subscription_plans
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
      
      console.log("Raw subscriber data:", data);
      
      // עיבוד מתקדם של נתוני התוכנית (plan)
      const processedData = data.map(subscriber => {
        // טיפול בנתוני התוכנית מהחיבור
        let plan = null;
        
        // טיפול במקרה שהתוכנית מגיעה כמערך 
        if (subscriber.plan && Array.isArray(subscriber.plan) && subscriber.plan.length > 0) {
          plan = subscriber.plan[0];
        } 
        // טיפול במקרה שהתוכנית מגיעה כאובייקט
        else if (subscriber.plan && typeof subscriber.plan === 'object' && !Array.isArray(subscriber.plan)) {
          plan = subscriber.plan;
        }
        
        // אם יש subscription_plan_id אבל אין plan, ננסה לחלץ מידע בסיסי לגביו
        if (!plan && subscriber.subscription_plan_id) {
          console.log(`Subscriber ${subscriber.id} has subscription_plan_id ${subscriber.subscription_plan_id} but no plan data`);
        }
        
        return {
          ...subscriber,
          plan
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
