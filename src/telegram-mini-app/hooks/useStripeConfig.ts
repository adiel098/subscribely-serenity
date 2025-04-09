
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Plan } from "@/telegram-mini-app/types/community.types";

export const useStripeConfig = (selectedPlan: Plan) => {
  const [stripeConfig, setStripeConfig] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStripeConfig = async () => {
      if (!selectedPlan?.community_id) {
        setIsLoading(false);
        return;
      }
      
      try {
        console.log('Fetching Stripe config for community:', selectedPlan.community_id);
        
        // First, get the community owner's ID
        const { data: communityData, error: communityError } = await supabase
          .from('communities')
          .select('owner_id')
          .eq('id', selectedPlan.community_id)
          .single();

        if (communityError) {
          console.error('Error fetching community data:', communityError);
          setError('Could not fetch community data');
          return;
        }

        if (!communityData?.owner_id) {
          console.error('No owner_id found for community');
          setError('Community owner not found');
          return;
        }

        console.log('Found community owner:', communityData.owner_id);

        // Then, get the Stripe config for this owner
        const { data: paymentMethodData, error: paymentError } = await supabase
          .from('owner_payment_methods')
          .select('config')
          .eq('owner_id', communityData.owner_id)
          .eq('provider', 'stripe')
          .eq('is_active', true)
          .single();

        if (paymentError) {
          console.error('Error fetching Stripe config:', paymentError);
          setError('Could not fetch payment configuration');
          return;
        }

        console.log('Found payment method config:', paymentMethodData);

        if (paymentMethodData?.config) {
          setStripeConfig(paymentMethodData.config);
          setError(null);
        } else {
          console.error('No config found in payment method data');
          setError('Payment method not configured');
        }
      } catch (err) {
        console.error('Unexpected error in useStripeConfig:', err);
        setError('An unexpected error occurred');
      } finally {
        setIsLoading(false);
      }
    };

    fetchStripeConfig();
  }, [selectedPlan?.community_id]);

  return { stripeConfig, error, isLoading };
};
