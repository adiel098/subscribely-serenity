
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Plan } from '@/telegram-mini-app/types';

export const useStripeConfig = (plan: Plan) => {
  const [stripeConfig, setStripeConfig] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStripeConfig = async () => {
      try {
        const { data, error } = await supabase
          .from('payment_methods')
          .select('*')
          .eq('provider', 'stripe')
          .eq('is_active', true)
          .eq('community_id', plan.id)
          .maybeSingle();

        if (error) {
          throw new Error(error.message);
        }

        setStripeConfig(data?.config || null);
      } catch (err) {
        console.error('Error fetching Stripe config:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    if (plan) {
      fetchStripeConfig();
    }
  }, [plan]);

  return { stripeConfig, loading, error };
};
