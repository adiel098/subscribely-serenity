
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/auth/contexts/AuthContext";
import { SubscriptionStatus } from "@/telegram-mini-app/types/database.types";

export type PlatformSubscription = {
  id: string;
  status: string;
  subscription_start_date: string;
  subscription_end_date: string | null;
  plan_id: string;
  plan_name: string;
  plan_price: number;
  plan_interval: string;
  plan_features: string[];
  auto_renew: boolean;
};

export const useUserPlatformSubscription = () => {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState<PlatformSubscription | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchSubscription();
    }
  }, [user]);

  const fetchSubscription = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const { data, error } = await supabase
        .from('platform_subscriptions')
        .select(`
          id, 
          status, 
          subscription_start_date, 
          subscription_end_date,
          auto_renew,
          plan_id,
          platform_plans(name, price, interval, features)
        `)
        .eq('owner_id', user?.id)
        .eq('status', 'active')
        .single();

      if (error) {
        console.error("Error fetching subscription:", error);
        setError(error.message);
        setSubscription(null);
      } else if (data) {
        // Access platform_plans correctly as an object
        const planData = data.platform_plans as {
          name: string;
          price: number;
          interval: string;
          features: string[];
        };
        
        setSubscription({
          id: data.id,
          status: data.status,
          subscription_start_date: data.subscription_start_date,
          subscription_end_date: data.subscription_end_date,
          plan_id: data.plan_id,
          plan_name: planData.name,
          plan_price: planData.price,
          plan_interval: planData.interval,
          plan_features: planData.features || [],
          auto_renew: data.auto_renew
        });
      } else {
        setSubscription(null);
      }
    } catch (error) {
      console.error("Error:", error);
      setError("An unexpected error occurred");
      setSubscription(null);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleAutoRenew = async () => {
    if (!subscription) return;
    
    try {
      const newAutoRenewValue = !subscription.auto_renew;
      
      const { error } = await supabase
        .from('platform_subscriptions')
        .update({ auto_renew: newAutoRenewValue })
        .eq('id', subscription.id);

      if (error) {
        console.error("Error updating auto-renew:", error);
        toast.error("Failed to update auto-renewal setting");
        return;
      }

      // Update local state
      setSubscription({
        ...subscription,
        auto_renew: newAutoRenewValue
      });
      
      toast.success(`Auto-renewal ${newAutoRenewValue ? 'enabled' : 'disabled'}`);
    } catch (error) {
      console.error("Error:", error);
      toast.error("An unexpected error occurred");
    }
  };

  return {
    subscription,
    isLoading,
    error,
    refreshSubscription: fetchSubscription,
    toggleAutoRenew
  };
};
