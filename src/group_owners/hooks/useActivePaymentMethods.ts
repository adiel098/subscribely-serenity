
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { PaymentMethod } from "./types/subscription.types";
import { useAuth } from "@/auth/contexts/AuthContext";

/**
 * Hook to fetch only active payment methods that can be used for payments
 * Returns all active payment methods for the current user (owner) across all communities
 */
export const useActivePaymentMethods = () => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['active-payment-methods', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      try {
        // Get all active payment methods for the current user
        const { data, error } = await supabase
          .from('payment_methods')
          .select('*')
          .eq('owner_id', user.id)
          .eq('is_active', true);
          
        if (error) {
          console.error("Error fetching active payment methods:", error);
          throw error;
        }
        
        console.log("Active payment methods:", data);
        return data as PaymentMethod[];
      } catch (err) {
        console.error("Error in useActivePaymentMethods:", err);
        return [];
      }
    },
    enabled: !!user?.id
  });
};
