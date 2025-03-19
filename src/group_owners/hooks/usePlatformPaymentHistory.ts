
import { useState, useEffect } from 'react';
import { useAuth } from '@/auth/contexts/AuthContext';
import { supabase } from "@/integrations/supabase/client";
import { format } from 'date-fns';

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
            platform_plans(name)
          `)
          .eq('owner_id', user.id)
          .order('created_at', { ascending: false });

        if (error) throw error;

        const formattedPayments = data.map(payment => ({
          id: payment.id,
          date: format(new Date(payment.created_at), 'MMM d, yyyy'),
          planName: payment.platform_plans?.name || 'Unknown Plan',
          amount: payment.amount,
          formattedAmount: formatCurrency(payment.amount),
          paymentMethod: payment.payment_method || 'Unknown',
          status: payment.payment_status || 'Unknown'
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

// Helper function to format currency
const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
};
