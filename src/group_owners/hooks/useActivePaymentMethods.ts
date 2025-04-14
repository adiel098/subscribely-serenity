
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { PaymentMethod } from "./types/subscription.types";
import { useAuth } from "@/auth/contexts/AuthContext";
import { useRef } from "react";

/**
 * Hook to fetch only active payment methods that can be used for payments
 * Returns all active payment methods for the current user (owner) across all communities
 */
export const useActivePaymentMethods = () => {
  const { user } = useAuth();
  const loggedRef = useRef(false);
  const userIdRef = useRef<string | null>(null);
  
  return useQuery({
    queryKey: ['active-payment-methods', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      // Update userId ref if changed
      if (userIdRef.current !== user.id) {
        userIdRef.current = user.id;
      }
      
      try {
        // Get all active payment methods for the current user
        const { data, error } = await supabase
          .from('owner_payment_methods')
          .select('*')
          .eq('owner_id', user.id)
          .eq('is_active', true);
          
        if (error) {
          console.error("Error fetching active payment methods:", error);
          throw error;
        }
        
        // Log only once
        if (!loggedRef.current) {
          console.log("Active payment methods:", data);
          loggedRef.current = true;
        }
        
        return data as PaymentMethod[];
      } catch (err) {
        console.error("Error in useActivePaymentMethods:", err);
        return [];
      }
    },
    enabled: !!user?.id,
    staleTime: 300000, // Cache for 5 minutes
    refetchOnWindowFocus: false, // Don't refetch on window focus
    refetchOnMount: true, // Only refetch on mount
    refetchInterval: false // Don't automatically refetch at intervals
  });
};
