
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useActivePaymentMethods = () => {
  return useQuery({
    queryKey: ['active-platform-payment-methods'],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('platform_payment_methods')
          .select('*')
          .eq('is_active', true);

        if (error) {
          console.error('Error fetching active payment methods:', error);
          toast.error('Failed to load payment methods');
          throw error;
        }
        
        console.log('Active payment methods:', data);
        return data || [];
      } catch (err) {
        console.error('Error:', err);
        throw err;
      }
    },
    staleTime: 5 * 60 * 1000, // Keep data fresh for 5 minutes
    refetchOnWindowFocus: false
  });
};
