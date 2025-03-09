
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";

/**
 * Hook to fetch plan details for subscription dates calculation
 */
export const useFetchPlanDetails = () => {
  const [isLoading, setIsLoading] = useState(false);
  
  const fetchPlanDetails = async (planId: string) => {
    setIsLoading(true);
    console.log('[useFetchPlanDetails] Fetching plan details for subscription dates calculation');
    
    try {
      const { data: planDetails, error: planError } = await supabase
        .from('subscription_plans')
        .select('interval, price')
        .eq('id', planId)
        .single();
        
      if (planError) {
        console.warn('[useFetchPlanDetails] Error fetching plan details:', planError);
        return null;
      } 
      
      console.log('[useFetchPlanDetails] Retrieved plan details:', planDetails);
      return planDetails;
    } catch (err) {
      console.error('[useFetchPlanDetails] Error:', err);
      return null;
    } finally {
      setIsLoading(false);
    }
  };
  
  return {
    fetchPlanDetails,
    isLoading
  };
};
