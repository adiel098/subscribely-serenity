import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';

export const useNOWPaymentsStatus = (onSuccess?: () => void) => {
  const [isChecking, setIsChecking] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<string | null>(null);
  const [paymentData, setPaymentData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const checkStoredTransaction = async () => {
      const storedTransaction = localStorage.getItem('nowpayments_transaction');
      if (!storedTransaction) return;
      
      try {
        const transaction = JSON.parse(storedTransaction);
        
        // Remove transactions older than 1 hour
        if (Date.now() - transaction.timestamp > 3600000) {
          localStorage.removeItem('nowpayments_transaction');
          return;
        }
        
        setIsChecking(true);
        
        try {
          const { data, error } = await supabase
            .from('payments')
            .select('id, status, metadata')
            .eq('external_id', transaction.invoiceId || transaction.paymentId)
            .single();
            
          if (error) {
            setError(`שגיאה בבדיקת סטטוס תשלום: ${error.message}`);
            return;
          }
          
          if (data) {
            setPaymentStatus(data.status);
            setPaymentData(data);
            
            if (data.status === 'completed') {
              toast({
                title: "התשלום הושלם",
                description: "התשלום התקבל בהצלחה",
              });
              
              if (onSuccess) onSuccess();
              localStorage.removeItem('nowpayments_transaction');
            } else if (data.status === 'failed') {
              toast({
                title: "התשלום נכשל",
                description: "לא ניתן היה להשלים את התשלום",
                variant: "destructive"
              });
              localStorage.removeItem('nowpayments_transaction');
            } else {
              // Payment still processing, set up polling
              const intervalId = setInterval(async () => {
                try {
                  const { data: updatedData, error: refreshError } = await supabase
                    .from('payments')
                    .select('id, status, metadata')
                    .eq('external_id', transaction.invoiceId || transaction.paymentId)
                    .single();
                    
                  if (refreshError) {
                    return;
                  }
                  
                  if (updatedData && updatedData.status !== data.status) {
                    setPaymentStatus(updatedData.status);
                    setPaymentData(updatedData);
                    
                    if (updatedData.status === 'completed') {
                      clearInterval(intervalId);
                      toast({
                        title: "התשלום הושלם",
                        description: "התשלום התקבל בהצלחה",
                      });
                      
                      if (onSuccess) onSuccess();
                      localStorage.removeItem('nowpayments_transaction');
                    } else if (updatedData.status === 'failed') {
                      clearInterval(intervalId);
                      setPaymentStatus('failed');
                      toast({
                        title: "התשלום נכשל",
                        description: "לא ניתן היה להשלים את התשלום",
                        variant: "destructive"
                      });
                      
                      localStorage.removeItem('nowpayments_transaction');
                    }
                  }
                } catch (pollError) {
                }
              }, 10000); // check every 10 seconds
              
              return () => clearInterval(intervalId);
            }
          }
        } catch (dbError) {
          setError(`שגיאת מסד נתונים: ${dbError instanceof Error ? dbError.message : 'שגיאה לא ידועה'}`);
        } finally {
          setIsChecking(false);
        }
      } catch (parseError) {
        localStorage.removeItem('nowpayments_transaction');
      } finally {
        setIsChecking(false);
      }
    };
    
    checkStoredTransaction();
  }, [onSuccess]);
  
  return {
    isChecking,
    paymentStatus,
    paymentData,
    error,
    clearStoredTransaction: () => {
      localStorage.removeItem('nowpayments_transaction');
    }
  };
};
