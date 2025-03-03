
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
    id: string;
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
        SELECT: all columns, community, plan using plan_id as foreign key
        WHERE: telegram_user_id = ${telegramUserId}
        ORDER BY: created_at DESC
      `);
      
      // Fixed: Using correct Supabase join syntax for the subscription_plans table
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
      
      // Detailed debug logging for the plan data
      if (data && data.length > 0) {
        console.log("[usePaymentHistory] Full payment records:", JSON.stringify(data, null, 2));
        
        // Log plan info for each payment
        data.forEach((payment, index) => {
          console.log(`[usePaymentHistory] Payment #${index + 1} (${payment.id.substring(0, 8)}) plan info:`, {
            payment_id: payment.id,
            plan_id: payment.plan_id,
            plan: payment.plan,
            plan_name: payment.plan?.name || "No plan name",
            amount: payment.amount
          });
        });
      } else {
        console.log("[usePaymentHistory] No payment records found");
      }

      // If plans are still missing, fetch them directly as a fallback
      const missingPlanIds = data?.filter(payment => !payment.plan && payment.plan_id)
        .map(payment => payment.plan_id) || [];
      
      if (missingPlanIds.length > 0) {
        console.log(`[usePaymentHistory] Need to fetch ${missingPlanIds.length} missing plans:`, missingPlanIds);
        
        const uniquePlanIds = [...new Set(missingPlanIds)];
        const { data: planDetails, error: planError } = await supabase
          .from('subscription_plans')
          .select('id, name, interval, price')
          .in('id', uniquePlanIds);
          
        if (planError) {
          console.error("[usePaymentHistory] Error fetching plan details:", planError);
        } else if (planDetails && planDetails.length > 0) {
          console.log(`[usePaymentHistory] Found ${planDetails.length} plans:`, planDetails);
          
          // Create a map for quick lookup
          const planMap = planDetails.reduce((map, plan) => {
            map[plan.id] = plan;
            return map;
          }, {});
          
          // Assign plans to payments missing them
          data?.forEach(payment => {
            if (!payment.plan && payment.plan_id && planMap[payment.plan_id]) {
              payment.plan = planMap[payment.plan_id];
              console.log(`[usePaymentHistory] Applied missing plan to payment ${payment.id.substring(0, 8)}:`, payment.plan);
            }
          });
        }
      }
      
      // Always set the payments data, even with partial or missing plan info
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
