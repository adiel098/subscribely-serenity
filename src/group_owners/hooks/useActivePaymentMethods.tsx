
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

// Demo payment methods for testing
const demoPaymentMethods = [
  {
    id: "demo-stripe-1",
    provider: "stripe",
    is_active: true,
    config: { public_key: "demo_stripe_key" }
  },
  {
    id: "demo-paypal-1",
    provider: "paypal",
    is_active: true,
    config: { client_id: "demo_paypal_id" }
  },
  {
    id: "demo-crypto-1",
    provider: "crypto",
    is_active: true,
    config: { wallet_address: "demo_crypto_wallet" }
  }
];

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
        
        console.log('Active payment methods from DB:', data);
        
        // If no payment methods found in DB, return demo payment methods
        if (!data || data.length === 0) {
          console.log('Using demo payment methods for testing');
          return demoPaymentMethods;
        }
        
        return data;
      } catch (err) {
        console.error('Error:', err);
        console.log('Using demo payment methods due to error');
        return demoPaymentMethods;
      }
    },
    staleTime: 5 * 60 * 1000, // Keep data fresh for 5 minutes
    refetchOnWindowFocus: false
  });
};
