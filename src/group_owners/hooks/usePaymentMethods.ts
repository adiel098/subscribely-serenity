
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { PaymentMethod } from "./types/subscription.types";
import { useAuth } from "@/auth/contexts/AuthContext";
import { DEFAULT_PAYMENT_METHODS } from "@/group_owners/data/paymentMethodsData";

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
        
        console.log("Fetched payment methods:", data);
        
        // If no payment methods are found, initialize with defaults
        if (!data || data.length === 0) {
          console.log("No payment methods found, initializing defaults");
          
          const defaultMethods = DEFAULT_PAYMENT_METHODS.map(method => ({
            ...method,
            owner_id: user.id
          }));
          
          const { data: newMethods, error: insertError } = await supabase
            .from('payment_methods')
            .insert(defaultMethods)
            .select();
            
          if (insertError) {
            console.error("Error creating default payment methods:", insertError);
            return [];
          }
          
          console.log("Created default payment methods:", newMethods);
          return newMethods as PaymentMethod[];
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
