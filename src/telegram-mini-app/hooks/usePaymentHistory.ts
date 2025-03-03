
import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

export interface PaymentHistoryItem {
  id: string;
  telegram_user_id: string;
  community_id: string;
  plan_id: string;
  amount: number;
  status: string;
  payment_method: string;
  invite_link: string | null;
  created_at: string;
  updated_at: string;
  community?: {
    name: string;
    telegram_photo_url?: string;
  };
  plan?: {
    name: string;
    interval: string;
    price: number;
  };
}

export const usePaymentHistory = (telegramUserId: string | undefined) => {
  const [payments, setPayments] = useState<PaymentHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchPaymentHistory = async () => {
    if (!telegramUserId) {
      setError("User ID is required");
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      console.log(`[usePaymentHistory] Fetching payment history for user ${telegramUserId}`);
      
      const { data, error } = await supabase
        .from('subscription_payments')
        .select(`
          *,
          community:communities!telegram_chat_members_community_id_fkey(
            id,
            name,
            telegram_photo_url
          ),
          plan:subscription_plans(
            id,
            name,
            interval,
            price
          )
        `)
        .eq('telegram_user_id', telegramUserId)
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      console.log(`[usePaymentHistory] Received ${data?.length || 0} payment records`, data);
      setPayments(data || []);
    } catch (err) {
      console.error("Error fetching payment history:", err);
      setError("Failed to fetch your payment history");
      toast({
        title: "Error",
        description: "Failed to load your payment history. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (telegramUserId) {
      fetchPaymentHistory();
    }
  }, [telegramUserId]);

  return { payments, isLoading, error, refetch: fetchPaymentHistory };
};
