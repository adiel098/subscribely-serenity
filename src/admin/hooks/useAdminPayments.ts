
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
      owner:profiles(full_name, email),
      plan:platform_plans(name)
    `)
    .order('created_at', { ascending: false });
    
  if (error) throw error;
  return data || [];
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
