
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
      
      console.log('Checking platform subscription for user:', user.id);
      
      // Query platform_subscriptions to check if user has an active subscription
      const { data, error } = await supabase
        .from('platform_subscriptions')
        .select('*')
        .eq('owner_id', user.id)
        .eq('status', 'active')
        .maybeSingle();
      
      if (error) {
        console.error('Error checking platform subscription:', error);
        throw error;
      }
      
      const hasPlatformPlan = !!data;
      console.log('Platform subscription check result:', { hasPlatformPlan, subscription: data });
      
      return { 
        hasPlatformPlan,
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
