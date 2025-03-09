
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export const usePlatformSubscription = () => {
  const [hasPlatformPlan, setHasPlatformPlan] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkPlatformSubscription = async () => {
      try {
        setIsLoading(true);
        
        const { data: session } = await supabase.auth.getSession();
        if (!session?.session?.user?.id) {
          console.log('No authenticated user found');
          setHasPlatformPlan(false);
          return;
        }
        
        console.log('Checking platform subscription for user:', session.session.user.id);
        
        const { data, error } = await supabase
          .from('platform_subscriptions')
          .select('*')
          .eq('owner_id', session.session.user.id)
          .eq('status', 'active')
          .maybeSingle();
        
        if (error) {
          console.error('Error fetching subscription:', error);
          setHasPlatformPlan(false);
          return;
        }
        
        if (data) {
          console.log('Active platform subscription found', data);
          setHasPlatformPlan(true);
        } else {
          console.log('No active platform subscription found');
          setHasPlatformPlan(false);
        }
      } catch (err) {
        console.error('Error checking platform subscription:', err);
        setHasPlatformPlan(false);
      } finally {
        setIsLoading(false);
      }
    };
    
    checkPlatformSubscription();
  }, []);

  return { hasPlatformPlan, isLoading };
};
