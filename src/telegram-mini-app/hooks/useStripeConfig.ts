
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Plan } from "../types/app.types";

export const useStripeConfig = (selectedPlan: Plan | null) => {
  const [stripeConfig, setStripeConfig] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStripeConfig = async () => {
      // Don't attempt to fetch if no plan or community_id is available
      if (!selectedPlan?.community_id) {
        return;
      }
      
      setIsLoading(true);
      setError(null);
      
      try {
        console.log('Fetching Stripe config for community:', selectedPlan.community_id);
        
        const { data, error } = await supabase
          .from('payment_methods')
          .select('config')
          .eq('community_id', selectedPlan.community_id)
          .eq('provider', 'stripe')
          .eq('is_active', true)
          .single();

        if (error) {
          console.error('Error fetching Stripe config:', error);
          setError(`Failed to load payment configuration: ${error.message}`);
          return;
        }

        if (data?.config) {
          console.log('Stripe config loaded successfully');
          setStripeConfig(data.config);
        } else {
          console.log('No Stripe config found for this community');
        }
      } catch (err) {
        console.error('Unexpected error in useStripeConfig:', err);
        setError('An unexpected error occurred while loading payment methods');
      } finally {
        setIsLoading(false);
      }
    };

    fetchStripeConfig();
  }, [selectedPlan?.community_id]);

  return { stripeConfig, isLoading, error };
};
