
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { PaymentMethod } from "./types/subscription.types";

/**
 * Hook to fetch payment methods for a specific community, including both
 * community-specific and default payment methods
 */
export const usePaymentMethods = (communityId: string | null) => {
  return useQuery({
    queryKey: ['payment-methods', communityId],
    queryFn: async () => {
      if (!communityId) return [];
      
      try {
        // Use the stored function to get all available payment methods
        const { data, error } = await supabase
          .rpc('get_available_payment_methods', {
            community_id_param: communityId
          });
          
        if (error) {
          console.error("Error fetching payment methods:", error);
          throw error;
        }
        
        return data as PaymentMethod[];
      } catch (err) {
        console.error("Error in usePaymentMethods:", err);
        // Try with the old method as fallback
        const { data, error } = await supabase
          .from('payment_methods')
          .select('*')
          .eq('community_id', communityId);
          
        if (error) {
          console.error("Fallback query also failed:", error);
          throw error;
        }
        
        return data as PaymentMethod[];
      }
    },
    enabled: !!communityId
  });
};

/**
 * Hook to fetch only active payment methods for a group
 */
export const useGroupPaymentMethods = (groupId: string | null) => {
  return useQuery({
    queryKey: ['group-payment-methods', groupId],
    queryFn: async () => {
      if (!groupId) return [];
      
      try {
        // Query direct payment methods for this group
        const { data: directMethods, error: directError } = await supabase
          .from('payment_methods')
          .select('*')
          .eq('group_id', groupId);
          
        if (directError) {
          console.error("Error fetching group payment methods:", directError);
          throw directError;
        }
        
        // Also get default payment methods that should apply to all communities
        const { data: defaultMethods, error: defaultError } = await supabase
          .from('payment_methods')
          .select('*')
          .eq('is_default', true);
          
        if (defaultError) {
          console.error("Error fetching default payment methods:", defaultError);
          throw defaultError;
        }
        
        // Merge both sets, prioritizing direct methods when there's a conflict
        const allMethods = [...(directMethods || [])];
        
        // Add default methods that don't conflict with direct ones
        if (defaultMethods) {
          const existingProviders = directMethods?.map(m => m.provider) || [];
          
          defaultMethods.forEach(method => {
            if (!existingProviders.includes(method.provider)) {
              allMethods.push(method);
            }
          });
        }
        
        return allMethods as PaymentMethod[];
      } catch (err) {
        console.error("Error in useGroupPaymentMethods:", err);
        return [];
      }
    },
    enabled: !!groupId
  });
};

/**
 * Hook to get all available payment methods (including defaults) for a community or group
 */
export const useAvailablePaymentMethods = (entityId: string | null, isGroup: boolean = false) => {
  return useQuery({
    queryKey: ['available-payment-methods', entityId, isGroup],
    queryFn: async () => {
      if (!entityId) return [];
      
      try {
        if (isGroup) {
          // Use the group payment methods hook
          const groupPaymentMethodsHook = useGroupPaymentMethods(entityId);
          return groupPaymentMethodsHook.data || [];
        } else {
          // Use the RPC function for community payment methods
          const { data, error } = await supabase
            .rpc('get_available_payment_methods', {
              community_id_param: entityId
            });
            
          if (error) {
            console.error("Error fetching available payment methods:", error);
            throw error;
          }
          
          return data as PaymentMethod[];
        }
      } catch (err) {
        console.error("Error in useAvailablePaymentMethods:", err);
        return [];
      }
    },
    enabled: !!entityId
  });
};
