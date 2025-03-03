
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
      
      // Notice we've removed the !plan_id from the query to allow correct join
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
      
      // Log all payment records for debugging
      if (data && data.length > 0) {
        console.log("[usePaymentHistory] Payment records:", JSON.stringify(data, null, 2));
      } else {
        console.log("[usePaymentHistory] No payment records found");
      }

      // Process payment data to ensure plan info is properly filled
      const processedPayments = data?.map(payment => {
        // Debug each payment's plan information
        console.log(`[usePaymentHistory] Processing payment ${payment.id}:`, {
          plan_id: payment.plan_id,
          plan: payment.plan,
          amount: payment.amount
        });
        
        // If plan is null but we have plan_id, try to fetch plan info directly
        if (!payment.plan && payment.plan_id) {
          console.log(`[usePaymentHistory] Payment has plan_id ${payment.plan_id} but no plan data, fetching plan directly`);
          
          // Return with fallback plan info, will be updated if direct fetch succeeds
          return {
            ...payment,
            plan: {
              id: payment.plan_id,
              name: `Plan (${payment.amount})`,
              interval: "unknown",
              price: payment.amount
            }
          };
        }
        return payment;
      }) || [];

      // For any payments with missing plan info but valid plan_id, try to fetch plans directly
      const paymentsWithMissingPlans = processedPayments.filter(
        payment => payment.plan?.name.startsWith('Plan (') && payment.plan_id
      );
      
      if (paymentsWithMissingPlans.length > 0) {
        console.log(`[usePaymentHistory] Found ${paymentsWithMissingPlans.length} payments with missing plan info. Fetching plans...`);
        
        // Collect all unique plan IDs that need fetching
        const planIdsToFetch = [...new Set(paymentsWithMissingPlans.map(p => p.plan_id))];
        console.log(`[usePaymentHistory] Fetching plan details for IDs:`, planIdsToFetch);
        
        // Fetch plan details for all missing plans in one query
        const { data: planDetails, error: planError } = await supabase
          .from('subscription_plans')
          .select('id, name, interval, price')
          .in('id', planIdsToFetch);
          
        if (planError) {
          console.error("[usePaymentHistory] Error fetching plan details:", planError);
        } else if (planDetails && planDetails.length > 0) {
          console.log(`[usePaymentHistory] Found ${planDetails.length} plan details:`, planDetails);
          
          // Create a map of plan ID to plan details for easy lookup
          const planMap = planDetails.reduce((map, plan) => {
            map[plan.id] = plan;
            return map;
          }, {});
          
          // Update processed payments with actual plan details where available
          processedPayments.forEach(payment => {
            if (payment.plan_id && planMap[payment.plan_id]) {
              console.log(`[usePaymentHistory] Updating payment ${payment.id} with plan details:`, planMap[payment.plan_id]);
              payment.plan = planMap[payment.plan_id];
            }
          });
        } else {
          console.log("[usePaymentHistory] No additional plan details found");
        }
      }

      setPayments(processedPayments);
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
