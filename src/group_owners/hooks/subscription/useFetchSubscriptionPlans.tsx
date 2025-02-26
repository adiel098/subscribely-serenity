
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { SubscriptionPlan } from "../types/subscription.types";

export const useFetchSubscriptionPlans = (communityId: string) => {
  return useQuery({
    queryKey: ['subscription-plans', communityId],
    queryFn: async () => {
      console.log('Fetching plans for community:', communityId);
      
      if (!communityId) {
        console.log('No communityId provided, returning empty array');
        return [];
      }

      const { data: session } = await supabase.auth.getSession();
      if (!session?.session?.access_token) {
        console.error('No access token found');
        throw new Error('Authentication required');
      }
      
      const { data, error } = await supabase
        .from('subscription_plans')
        .select('*')
        .eq('community_id', communityId)
        .eq('is_active', true)
        .order('price', { ascending: true });

      if (error) {
        console.error('Error fetching plans:', error);
        toast.error('Failed to load subscription plans');
        throw error;
      }
      
      console.log('Successfully fetched plans:', data);
      return data as SubscriptionPlan[];
    },
    enabled: Boolean(communityId),
    staleTime: 1000,
    refetchOnWindowFocus: true,
    retry: 2,
  });
};
