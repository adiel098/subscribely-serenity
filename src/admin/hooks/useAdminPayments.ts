
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { formatCurrency } from "@/lib/utils";

export interface PaymentItem {
  id: string;
  user: string;
  email: string;
  amount: number | string;
  community: string;
  date: string;
  method: string;
  status: string;
  raw_data: any;
}

export interface AdminPaymentsResult {
  platformPayments: PaymentItem[];
  communityPayments: PaymentItem[];
  isLoading: boolean;
  isError: boolean;
  refetch: () => Promise<any>;
}

export const useAdminPayments = (): AdminPaymentsResult => {
  const [platformPayments, setPlatformPayments] = useState<PaymentItem[]>([]);
  const [communityPayments, setCommunityPayments] = useState<PaymentItem[]>([]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const { isLoading, isError, refetch } = useQuery({
    queryKey: ["admin-payments"],
    queryFn: async () => {
      // Fetch platform payments
      const { data: platformData, error: platformError } = await supabase
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
      
      if (platformError) throw platformError;
      
      // Transform platform data to match the PaymentItem interface
      const transformedPlatformData: PaymentItem[] = (platformData || []).map(item => ({
        id: item.id,
        user: item.owner?.[0]?.full_name || 'Unknown',
        email: item.owner?.[0]?.email || 'No email',
        amount: item.amount,
        community: item.plan?.[0]?.name || 'Platform Payment',
        date: formatDate(item.created_at),
        method: item.payment_method || '',
        status: item.payment_status || '',
        raw_data: item
      }));
      
      setPlatformPayments(transformedPlatformData);
      
      // Fetch community payments
      const { data: communityData, error: communityError } = await supabase
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
      
      if (communityError) throw communityError;
      
      // Transform community data to match the PaymentItem interface
      const transformedCommunityData: PaymentItem[] = (communityData || []).map(item => ({
        id: item.id,
        user: `${item.first_name || ''} ${item.last_name || ''}`.trim() || 'Unknown',
        email: item.telegram_username || 'No username',
        amount: item.amount,
        community: item.community?.[0]?.name || 'Unknown Community',
        date: formatDate(item.created_at),
        method: item.payment_method || '',
        status: item.status || '',
        raw_data: item
      }));
      
      setCommunityPayments(transformedCommunityData);
      
      return {
        platformPayments: transformedPlatformData,
        communityPayments: transformedCommunityData
      };
    }
  });

  return {
    platformPayments,
    communityPayments,
    isLoading,
    isError,
    refetch
  };
};
