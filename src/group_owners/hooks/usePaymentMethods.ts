
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface PaymentMethod {
  id: string;
  provider: 'stripe' | 'paypal' | 'crypto';
  is_active: boolean;
  is_default?: boolean;
  config: Record<string, any>;
}

export const usePaymentMethods = (communityId: string | null) => {
  return useQuery({
    queryKey: ['payment-methods', communityId],
    queryFn: async () => {
      if (!communityId) return [];
      
      try {
        // Use the new stored function we created to get all available payment methods
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
        console.error("Error:", err);
        // Try with the old method as fallback
        const { data, error } = await supabase
          .from('payment_methods')
          .select('*')
          .eq('community_id', communityId);
          
        if (error) throw error;
        return data as PaymentMethod[];
      }
    },
    enabled: !!communityId
  });
};

// New hook to get all available payment methods (including defaults) for a community
export const useAvailablePaymentMethods = (communityId: string | null) => {
  return useQuery({
    queryKey: ['available-payment-methods', communityId],
    queryFn: async () => {
      if (!communityId) return [];
      
      const { data, error } = await supabase
        .rpc('get_available_payment_methods', {
          community_id_param: communityId
        });
        
      if (error) {
        console.error("Error fetching available payment methods:", error);
        throw error;
      }
      
      return data as PaymentMethod[];
    },
    enabled: !!communityId
  });
};
