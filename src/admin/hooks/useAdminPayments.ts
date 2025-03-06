
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
 * Fetches community payments from the database with complete community data
 * Ensures status field is properly queried and included
 */
const fetchCommunityPayments = async (): Promise<RawCommunityPayment[]> => {
  try {
    // First fetch all subscription payments
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
        community_id
      `)
      .order('created_at', { ascending: false });
      
    if (error) {
      console.error("Error fetching subscription payments:", error);
      throw error;
    }
    
    if (!data || data.length === 0) {
      return [];
    }

    // Log the payment status values for debugging
    data.forEach(payment => {
      console.log(`Payment ID: ${payment.id}, Raw Status: ${payment.status}`);
    });

    // Now fetch community details for each payment
    const paymentsWithCommunityData = await Promise.all(
      data.map(async (payment) => {
        if (!payment.community_id) {
          return {
            ...payment,
            community: {
              id: '',
              name: 'Unknown Community'
            }
          };
        }
        
        // Get community details
        const { data: communityData, error: communityError } = await supabase
          .from('communities')
          .select('id, name')
          .eq('id', payment.community_id)
          .single();
          
        if (communityError) {
          console.error(`Error fetching community for ID ${payment.community_id}:`, communityError);
          return {
            ...payment,
            community: {
              id: payment.community_id,
              name: 'Unknown Community'
            }
          };
        }
        
        return {
          ...payment,
          community: {
            id: communityData.id,
            name: communityData.name
          }
        };
      })
    );
    
    return paymentsWithCommunityData;
  } catch (err) {
    console.error("Error in fetchCommunityPayments:", err);
    throw err;
  }
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
