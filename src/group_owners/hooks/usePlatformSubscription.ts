
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/auth/contexts/AuthContext";
import { useRef } from "react";

export const usePlatformSubscription = () => {
  const { user } = useAuth();
  const loggedRef = useRef(false);
  const userIdRef = useRef<string | null>(null);

  const { data, isLoading, error } = useQuery({
    queryKey: ['platform-subscription', user?.id],
    queryFn: async () => {
      if (!user?.id) {
        return { hasPlatformPlan: false };
      }
      
      // Update userId ref and log only when user changes
      if (userIdRef.current !== user.id) {
        console.log('Checking platform subscription for user:', user.id);
        userIdRef.current = user.id;
      }
      
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
      
      // Only log on initial load or status changes
      if (!loggedRef.current) {
        console.log('Platform subscription check result:', { hasPlatformPlan, subscription: data });
        loggedRef.current = true;
      }
      
      return { 
        hasPlatformPlan,
        subscription: data || null 
      };
    },
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
    refetchOnMount: true,
    refetchInterval: false // Don't automatically refetch at intervals
  });

  return {
    hasPlatformPlan: data?.hasPlatformPlan || false,
    subscription: data?.subscription || null,
    isLoading,
    error
  };
};
