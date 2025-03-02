
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { SubscriptionPlan } from "../types/subscription.types";

export const useFetchSubscriptionPlans = (communityId: string) => {
  return useQuery({
    queryKey: ['subscription-plans', communityId],
    queryFn: async () => {
      console.log('🔍 useFetchSubscriptionPlans: Fetching plans for community:', communityId);
      
      if (!communityId) {
        console.log('❌ useFetchSubscriptionPlans: No communityId provided, returning empty array');
        return [];
      }

      const { data: session } = await supabase.auth.getSession();
      if (!session?.session?.access_token) {
        console.error('❌ useFetchSubscriptionPlans: No access token found');
        throw new Error('Authentication required');
      }
      
      console.log('✅ useFetchSubscriptionPlans: Session found, proceeding with query');
      
      const { data, error } = await supabase
        .from('subscription_plans')
        .select('*')
        .eq('community_id', communityId)
        .eq('is_active', true)
        .order('price', { ascending: true });

      if (error) {
        console.error('❌ useFetchSubscriptionPlans: Error fetching plans:', error);
        toast.error('Failed to load subscription plans');
        throw error;
      }
      
      console.log('✅ useFetchSubscriptionPlans: Successfully fetched plans for community:', communityId);
      console.log('🔍 useFetchSubscriptionPlans: Retrieved plans count:', data?.length || 0);
      
      if (data?.length) {
        data.forEach((plan, index) => {
          console.log(`   Plan ${index + 1}: ${plan.name}, $${plan.price}/${plan.interval}`);
        });
      } else {
        console.warn('⚠️ useFetchSubscriptionPlans: No active plans found for this community');
      }
      
      return data as SubscriptionPlan[];
    },
    enabled: Boolean(communityId),
    staleTime: 5 * 60 * 1000, // Keep data fresh for 5 minutes
    refetchOnWindowFocus: false,
    refetchOnMount: true,
    retry: 3,
    retryDelay: attempt => Math.min(attempt > 1 ? 2 ** attempt * 1000 : 1000, 30 * 1000)
  });
};
