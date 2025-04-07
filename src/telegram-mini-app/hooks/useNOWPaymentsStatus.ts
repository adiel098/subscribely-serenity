import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';

export const useNOWPaymentsStatus = (onSuccess?: () => void) => {
  const [isChecking, setIsChecking] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<string | null>(null);
  const [paymentData, setPaymentData] = useState<any>(null);
  
  // Check for stored NOWPayments transaction on mount
  useEffect(() => {
    const checkStoredTransaction = async () => {
      const storedTransaction = localStorage.getItem('nowpayments_transaction');
      if (!storedTransaction) return;
      
      try {
        const transaction = JSON.parse(storedTransaction);
        console.log("Found stored NOWPayments transaction:", transaction);
        
        // If transaction is older than 1 hour, remove it
        if (Date.now() - transaction.timestamp > 3600000) {
          localStorage.removeItem('nowpayments_transaction');
          return;
        }
        
        setIsChecking(true);
        
        // Try to find the payment by external_id
        const { data, error } = await supabase
          .from('payments')
          .select('id, status, metadata')
          .eq('external_id', transaction.paymentId)
          .maybeSingle();
          
        if (error) {
          console.error("Error checking payment status:", error);
          setIsChecking(false);
          return;
        }
        
        if (data) {
          console.log("Found payment record:", data);
          setPaymentStatus(data.status);
          setPaymentData(data);
          
          if (data.status === 'completed') {
            toast({
              title: "Payment Successful",
              description: "Your crypto payment has been confirmed!",
            });
            
            if (onSuccess) onSuccess();
            localStorage.removeItem('nowpayments_transaction');
          } else if (data.status === 'failed') {
            toast({
              title: "Payment Failed",
              description: "Your crypto payment could not be processed.",
              variant: "destructive"
            });
            localStorage.removeItem('nowpayments_transaction');
          } else {
            // Set up polling to check status
            const intervalId = setInterval(async () => {
              const { data: updatedData } = await supabase
                .from('payments')
                .select('status, metadata')
                .eq('id', data.id)
                .single();
                
              if (updatedData && updatedData.status === 'completed') {
                clearInterval(intervalId);
                setPaymentStatus('completed');
                setPaymentData(updatedData);
                
                toast({
                  title: "Payment Successful",
                  description: "Your crypto payment has been confirmed!",
                });
                
                if (onSuccess) onSuccess();
                localStorage.removeItem('nowpayments_transaction');
              } else if (updatedData && updatedData.status === 'failed') {
                clearInterval(intervalId);
                setPaymentStatus('failed');
                
                toast({
                  title: "Payment Failed",
                  description: "Your crypto payment could not be processed.",
                  variant: "destructive"
                });
                
                localStorage.removeItem('nowpayments_transaction');
              }
            }, 10000); // Check every 10 seconds
            
            // Clean up interval on component unmount
            return () => clearInterval(intervalId);
          }
        } else {
          console.log("Payment not found in database yet");
          // This could happen if the payment was just created and hasn't been processed yet
          // We'll keep the transaction in localStorage for now
        }
      } catch (error) {
        console.error("Error processing stored transaction:", error);
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
    clearStoredTransaction: () => localStorage.removeItem('nowpayments_transaction')
  };
};
