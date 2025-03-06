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
  // First, fetch all platform payments with owner_id
  const { data, error } = await supabase
    .from('platform_payments')
    .select(`
      id,
      amount,
      created_at,
      payment_method,
      payment_status,
      plan_id,
      owner_id
    `)
    .order('created_at', { ascending: false });
    
  if (error) throw error;
  
  // Now for each payment, get the owner profile information and plan name in parallel
  const paymentsWithFullData = await Promise.all(
    (data || []).map(async (payment) => {
      // Fetch plan name
      const [planResult, profileResult] = await Promise.all([
        supabase
          .from('platform_plans')
          .select('name')
          .eq('id', payment.plan_id)
          .single(),
          
        supabase
          .from('profiles')
          .select('full_name, email')
          .eq('id', payment.owner_id)
          .single()
      ]);
      
      // Return the payment with additional data
      return {
        ...payment,
        plan_name: planResult.data?.name || 'Unknown Plan',
        profiles: profileResult.error ? [] : [profileResult.data]
      };
    })
  );
  
  return paymentsWithFullData || [];
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
      telegram_user_id,
      community:communities(name)
    `)
    .order('created_at', { ascending: false });
    
  if (error) throw error;

  return (data || []).map(item => ({
    ...item,
    community: {
      name: item.community?.[0]?.name || 'Unknown Community'
    }
  }));
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
        
        console.log("Platform payments with profile data:", platformData);
        console.log("Community payments data:", communityData);
        
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
