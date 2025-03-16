
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { PaymentMethod } from "./types/subscription.types";

/**
 * Hook to fetch only active payment methods that can be used for payments
 */
export const useActivePaymentMethods = (communityId?: string | null) => {
  return useQuery({
    queryKey: ['active-payment-methods', communityId],
    queryFn: async () => {
      if (!communityId) return [];
      
      try {
        // Use the stored function to get all available payment methods
        const { data, error } = await supabase
          .rpc('get_available_payment_methods', {
            community_id_param: communityId
          });
          
        if (error) {
          console.error("Error fetching active payment methods:", error);
          // Fall back to direct query as a backup
          const { data: fallbackData, error: fallbackError } = await supabase
            .from('payment_methods')
            .select('*')
            .eq('community_id', communityId)
            .eq('is_active', true);
            
          if (fallbackError) {
            console.error("Fallback query also failed:", fallbackError);
            throw fallbackError;
          }
          
          return (fallbackData || []) as PaymentMethod[];
        }
        
        // Filter to only active payment methods
        return (data || []).filter((method: PaymentMethod) => method.is_active) as PaymentMethod[];
      } catch (err) {
        console.error("Error in useActivePaymentMethods:", err);
        return [];
      }
    },
    enabled: !!communityId
  });
};
