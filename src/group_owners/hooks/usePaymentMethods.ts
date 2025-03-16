
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { PaymentMethod } from "./types/subscription.types";
import { useAuth } from "@/auth/contexts/AuthContext";

/**
 * Hook to fetch all payment methods for the current user (owner)
 */
export const usePaymentMethods = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['payment-methods', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      try {
        // Get all payment methods for the current user using owner_id
        const { data, error } = await supabase
          .from('payment_methods')
          .select('*')
          .eq('owner_id', user.id);
          
        if (error) {
          console.error("Error fetching payment methods:", error);
          throw error;
        }
        
        return data as PaymentMethod[];
      } catch (err) {
        console.error("Error in usePaymentMethods:", err);
        return [];
      }
    },
    enabled: !!user?.id
  });
};
