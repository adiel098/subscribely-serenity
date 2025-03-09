
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/auth/contexts/AuthContext";

export const usePlatformSubscription = () => {
  const { user } = useAuth();

  const { data, isLoading, error } = useQuery({
    queryKey: ['platform-subscription', user?.id],
    queryFn: async () => {
      if (!user?.id) {
        return { hasPlatformPlan: false };
      }
      
      // Query platform_subscriptions to check if user has an active subscription
      const { data, error } = await supabase
        .from('platform_subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .single();
      
      if (error && error.code !== 'PGRST116') {
        console.error('Error checking platform subscription:', error);
        throw error;
      }
      
      return { 
        hasPlatformPlan: !!data,
        subscription: data || null 
      };
    },
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  return {
    hasPlatformPlan: data?.hasPlatformPlan || false,
    subscription: data?.subscription || null,
    isLoading,
    error
  };
};
