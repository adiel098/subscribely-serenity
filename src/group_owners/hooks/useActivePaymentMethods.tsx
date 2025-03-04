
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

export const useActivePaymentMethods = () => {
  const [data, setData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchPaymentMethods = async () => {
      try {
        setIsLoading(true);
        
        const { data: paymentMethods, error: fetchError } = await supabase
          .from('platform_payment_methods')
          .select('*')
          .eq('is_active', true);
          
        if (fetchError) {
          throw fetchError;
        }
        
        console.log('Active payment methods from DB:', paymentMethods);
        setData(paymentMethods || []);
      } catch (err: any) {
        console.error('Error fetching data:', err);
        setError(err);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load payment methods."
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchPaymentMethods();
  }, [toast]);

  return { data, isLoading, error };
};
