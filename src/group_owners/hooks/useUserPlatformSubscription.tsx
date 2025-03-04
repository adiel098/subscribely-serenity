
import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/auth/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

export interface PlatformSubscription {
  id: string;
  status: string;
  subscription_start_date: string;
  subscription_end_date: string;
  auto_renew: boolean;
  plan: {
    id: string;
    name: string;
    price: number;
    interval: string;
    description: string;
    features: string[];
  } | null;
}

export const useUserPlatformSubscription = () => {
  const [subscription, setSubscription] = useState<PlatformSubscription | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchSubscription = async () => {
    if (!user?.id) {
      setIsLoading(false);
      setError("User not authenticated");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase
        .from('platform_subscriptions')
        .select(`
          *,
          plan:platform_plans(
            id,
            name,
            price,
            interval,
            description,
            features
          )
        `)
        .eq('owner_id', user.id)
        .eq('status', 'active')
        .order('subscription_start_date', { ascending: false })
        .maybeSingle();

      if (error) throw error;
      setSubscription(data);
    } catch (err) {
      console.error("Error fetching platform subscription:", err);
      setError("Failed to load subscription details");
      toast({
        title: "Error",
        description: "Failed to load your subscription details",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscription();
  }, [user?.id]);

  return {
    subscription,
    isLoading,
    error,
    refetch: fetchSubscription
  };
};
