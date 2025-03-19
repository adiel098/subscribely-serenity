
import { useState, useEffect } from 'react';
import { useAuth } from '@/auth/contexts/AuthContext';
import { supabase } from "@/integrations/supabase/client";
import { format } from 'date-fns';
import { formatCurrency } from '@/lib/utils';

export interface PlatformPaymentHistory {
  id: string;
  date: string;
  planName: string;
  amount: number;
  formattedAmount: string;
  paymentMethod: string;
  status: string;
}

export const usePlatformPaymentHistory = () => {
  const { user } = useAuth();
  const [payments, setPayments] = useState<PlatformPaymentHistory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchPaymentHistory = async () => {
      if (!user?.id) return;
      
      try {
        setIsLoading(true);
        
        const { data, error } = await supabase
          .from('platform_payments')
          .select(`
            id, 
            created_at, 
            amount, 
            payment_method, 
            payment_status,
            plan_id,
            platform_plans (name)
          `)
          .eq('owner_id', user.id)
          .order('created_at', { ascending: false });

        if (error) throw error;

        // Fetch plan names separately if needed
        const formattedPayments = await Promise.all(data.map(async (payment) => {
          let planName = 'Unknown Plan';
          
          // Check if platform_plans has data and extract the name
          if (payment.platform_plans && Array.isArray(payment.platform_plans) && payment.platform_plans.length > 0) {
            // Type assertion to ensure name is treated as a string
            planName = String(payment.platform_plans[0]?.name || 'Unknown Plan');
          } else if (payment.platform_plans && typeof payment.platform_plans === 'object' && 'name' in payment.platform_plans) {
            // Type assertion to ensure name is treated as a string
            planName = String(payment.platform_plans.name || 'Unknown Plan');
          } else if (payment.plan_id) {
            // Fetch the plan name directly if needed
            const { data: planData } = await supabase
              .from('platform_plans')
              .select('name')
              .eq('id', payment.plan_id)
              .single();
            
            if (planData && planData.name) {
              planName = String(planData.name);
            }
          }
          
          return {
            id: payment.id,
            date: format(new Date(payment.created_at), 'MMM d, yyyy'),
            planName,
            amount: payment.amount,
            formattedAmount: formatCurrency(payment.amount),
            paymentMethod: payment.payment_method || 'Unknown',
            status: payment.payment_status || 'Unknown'
          };
        }));

        setPayments(formattedPayments);
      } catch (err) {
        console.error('Error fetching payment history:', err);
        setError(err instanceof Error ? err : new Error('Unknown error occurred'));
      } finally {
        setIsLoading(false);
      }
    };

    fetchPaymentHistory();
  }, [user?.id]);

  return { payments, isLoading, error };
};
