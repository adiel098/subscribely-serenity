
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface PaymentMethod {
  id: string;
  provider: 'stripe' | 'paypal' | 'crypto';
  is_active: boolean;
  config: Record<string, any>;
}

export const usePaymentMethods = (communityId: string | null) => {
  return useQuery({
    queryKey: ['payment-methods', communityId],
    queryFn: async () => {
      if (!communityId) return [];
      
      const { data, error } = await supabase
        .from('payment_methods')
        .select('*')
        .eq('community_id', communityId);
        
      if (error) throw error;
      return data as PaymentMethod[];
    },
    enabled: !!communityId
  });
};
