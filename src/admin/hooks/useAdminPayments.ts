
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { 
  PaymentItem, 
  transformPlatformPayments, 
  transformCommunityPayments,
  RawPlatformPayment,
  RawCommunityPayment
} from "../utils/paymentTransformers";

export type { PaymentItem };

export interface AdminPaymentsResult {
  platformPayments: PaymentItem[];
  communityPayments: PaymentItem[];
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  refetch: () => Promise<any>;
}

/**
 * Fetches platform payments from the database
 */
const fetchPlatformPayments = async (): Promise<RawPlatformPayment[]> => {
  const { data, error } = await supabase
    .from('platform_payments')
    .select(`
      id,
      amount,
      created_at,
      payment_method,
      payment_status,
      plan_id,
      owner_id,
      profiles!platform_payments_owner_id_fkey(full_name, email)
    `)
    .order('created_at', { ascending: false });
    
  if (error) throw error;
  
  // For each payment, fetch the plan name
  const paymentsWithPlanData = await Promise.all(
    (data || []).map(async (payment) => {
      const { data: planData, error: planError } = await supabase
        .from('platform_plans')
        .select('name')
        .eq('id', payment.plan_id)
        .single();
        
      if (planError) {
        console.error("Error fetching plan data:", planError);
        return {
          ...payment,
          plan_name: 'Unknown Plan'
        };
      }
      
      return {
        ...payment,
        plan_name: planData?.name || 'Unknown Plan'
      };
    })
  );
  
  return paymentsWithPlanData || [];
};

/**
 * Fetches community payments from the database
 */
const fetchCommunityPayments = async (): Promise<RawCommunityPayment[]> => {
  const { data, error } = await supabase
    .from('subscription_payments')
    .select(`
      id,
      amount,
      created_at,
      payment_method,
      status,
      first_name,
      last_name,
      telegram_username,
      community:communities(name)
    `)
    .order('created_at', { ascending: false });
    
  if (error) throw error;
  return data || [];
};

/**
 * Hook for fetching and managing both platform and community payment data
 */
export const useAdminPayments = (): AdminPaymentsResult => {
  const [platformPayments, setPlatformPayments] = useState<PaymentItem[]>([]);
  const [communityPayments, setCommunityPayments] = useState<PaymentItem[]>([]);

  const { 
    isLoading, 
    isError, 
    error,
    refetch 
  } = useQuery({
    queryKey: ["admin-payments"],
    queryFn: async () => {
      try {
        // Fetch both types of payments in parallel
        const [platformData, communityData] = await Promise.all([
          fetchPlatformPayments(),
          fetchCommunityPayments()
        ]);
        
        // Transform the raw data into standardized format
        const transformedPlatformData = transformPlatformPayments(platformData);
        const transformedCommunityData = transformCommunityPayments(communityData);
        
        // Update state
        setPlatformPayments(transformedPlatformData);
        setCommunityPayments(transformedCommunityData);
        
        return {
          platformPayments: transformedPlatformData,
          communityPayments: transformedCommunityData
        };
      } catch (err) {
        console.error("Error fetching payment data:", err);
        throw err;
      }
    }
  });

  return {
    platformPayments,
    communityPayments,
    isLoading,
    isError,
    error,
    refetch
  };
};
