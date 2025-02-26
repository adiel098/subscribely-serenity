
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Plan } from "@/telegram-mini-app/pages/TelegramMiniApp";

export const useStripeConfig = (selectedPlan: Plan) => {
  const [stripeConfig, setStripeConfig] = useState<any>(null);

  useEffect(() => {
    const fetchStripeConfig = async () => {
      if (!selectedPlan?.community_id) return;
      
      const { data, error } = await supabase
        .from('payment_methods')
        .select('config')
        .eq('community_id', selectedPlan.community_id)
        .eq('provider', 'stripe')
        .eq('is_active', true)
        .single();

      if (error) {
        console.error('Error fetching Stripe config:', error);
        return;
      }

      if (data?.config) {
        setStripeConfig(data.config);
      }
    };

    fetchStripeConfig();
  }, [selectedPlan?.community_id]);

  return stripeConfig;
};
