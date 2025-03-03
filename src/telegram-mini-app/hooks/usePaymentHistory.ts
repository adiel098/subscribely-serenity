
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
      console.error("[usePaymentHistory] Error: telegramUserId is undefined or empty");
      setError("User ID is required");
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      console.log(`[usePaymentHistory] Fetching payment history for user ${telegramUserId}`);
      
      // Log the SQL query we're about to make (in a readable format)
      console.log(`[usePaymentHistory] Query: 
        FROM: subscription_payments
        SELECT: all columns, community, plan
        WHERE: telegram_user_id = ${telegramUserId}
        ORDER BY: created_at DESC
      `);
      
      const { data, error: queryError } = await supabase
        .from('subscription_payments')
        .select(`
          *,
          community:communities(
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

      if (queryError) {
        console.error("[usePaymentHistory] Supabase query error:", queryError);
        throw queryError;
      }

      console.log(`[usePaymentHistory] Received ${data?.length || 0} payment records`);
      
      // Log the first payment record for debugging (if any)
      if (data && data.length > 0) {
        console.log("[usePaymentHistory] First payment record sample:", JSON.stringify(data[0], null, 2));
      } else {
        console.log("[usePaymentHistory] No payment records found");
      }

      setPayments(data || []);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      console.error(`[usePaymentHistory] Error fetching payment history:`, err);
      console.error(`[usePaymentHistory] Error message:`, errorMessage);
      
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
      console.log(`[usePaymentHistory] useEffect triggered with telegramUserId: ${telegramUserId}`);
      fetchPaymentHistory();
    } else {
      console.log(`[usePaymentHistory] useEffect skipped - no telegramUserId provided`);
    }
  }, [telegramUserId]);

  return { payments, isLoading, error, refetch: fetchPaymentHistory };
};
