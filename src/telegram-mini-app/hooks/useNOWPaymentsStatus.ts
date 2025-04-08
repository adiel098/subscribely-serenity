
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { logNOWPaymentsOperation } from '../components/debug/NOWPaymentsLogs';

export const useNOWPaymentsStatus = (onSuccess?: () => void) => {
  const [isChecking, setIsChecking] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<string | null>(null);
  const [paymentData, setPaymentData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  
  // בדיקת עסקת NOWPayments מאוחסנת בעת טעינה
  useEffect(() => {
    const checkStoredTransaction = async () => {
      const storedTransaction = localStorage.getItem('nowpayments_transaction');
      if (!storedTransaction) return;
      
      try {
        const transaction = JSON.parse(storedTransaction);
        console.log("Found stored NOWPayments transaction:", transaction);
        logNOWPaymentsOperation('info', 'נמצאה עסקת NOWPayments מאוחסנת', transaction);
        
        // אם העסקה ישנה יותר משעה, מוחק אותה
        if (Date.now() - transaction.timestamp > 3600000) {
          localStorage.removeItem('nowpayments_transaction');
          logNOWPaymentsOperation('info', 'מחיקת עסקת NOWPayments ישנה', { 
            age: Math.round((Date.now() - transaction.timestamp) / 60000) + ' דקות' 
          });
          return;
        }
        
        setIsChecking(true);
        
        try {
          // מנסה למצוא את התשלום לפי external_id
          const { data, error } = await supabase
            .from('payments')
            .select('id, status, metadata')
            .eq('external_id', transaction.invoiceId || transaction.paymentId)
            .maybeSingle();
            
          if (error) {
            console.error("Error checking payment status:", error);
            logNOWPaymentsOperation('error', 'שגיאה בבדיקת סטטוס תשלום', { error });
            setIsChecking(false);
            setError(`שגיאה בבדיקת סטטוס תשלום: ${error.message}`);
            return;
          }
          
          if (data) {
            console.log("Found payment record:", data);
            logNOWPaymentsOperation('info', 'נמצא רשומת תשלום', data);
            setPaymentStatus(data.status);
            setPaymentData(data);
            
            if (data.status === 'completed') {
              toast({
                title: "תשלום התקבל בהצלחה",
                description: "תשלום הקריפטו שלך אושר!",
              });
              
              if (onSuccess) onSuccess();
              localStorage.removeItem('nowpayments_transaction');
              logNOWPaymentsOperation('info', 'תשלום הושלם, עסקה נמחקה מהאחסון המקומי');
            } else if (data.status === 'failed') {
              toast({
                title: "התשלום נכשל",
                description: "לא ניתן היה לעבד את תשלום הקריפטו שלך.",
                variant: "destructive"
              });
              localStorage.removeItem('nowpayments_transaction');
              logNOWPaymentsOperation('error', 'תשלום נכשל, עסקה נמחקה מהאחסון המקומי');
            } else {
              logNOWPaymentsOperation('info', 'תשלום עדיין בעיבוד, מגדיר פולינג', { status: data.status });
              
              // הגדרת פולינג לבדיקת סטטוס
              const intervalId = setInterval(async () => {
                try {
                  const { data: updatedData, error: refreshError } = await supabase
                    .from('payments')
                    .select('status, metadata')
                    .eq('id', data.id)
                    .single();
                    
                  if (refreshError) {
                    console.error("Error refreshing payment status:", refreshError);
                    return;
                  }
                  
                  if (updatedData && updatedData.status === 'completed') {
                    clearInterval(intervalId);
                    setPaymentStatus('completed');
                    setPaymentData(updatedData);
                    
                    toast({
                      title: "תשלום התקבל בהצלחה",
                      description: "תשלום הקריפטו שלך אושר!",
                    });
                    
                    if (onSuccess) onSuccess();
                    localStorage.removeItem('nowpayments_transaction');
                    logNOWPaymentsOperation('info', 'תשלום הושלם (מפולינג), עסקה נמחקה מהאחסון המקומי');
                  } else if (updatedData && updatedData.status === 'failed') {
                    clearInterval(intervalId);
                    setPaymentStatus('failed');
                    
                    toast({
                      title: "התשלום נכשל",
                      description: "לא ניתן היה לעבד את תשלום הקריפטו שלך.",
                      variant: "destructive"
                    });
                    
                    localStorage.removeItem('nowpayments_transaction');
                    logNOWPaymentsOperation('error', 'תשלום נכשל (מפולינג), עסקה נמחקה מהאחסון המקומי');
                  }
                } catch (pollError) {
                  console.error("Error polling payment status:", pollError);
                  logNOWPaymentsOperation('error', 'שגיאה בפולינג סטטוס תשלום', { 
                    error: pollError instanceof Error ? pollError.message : String(pollError)
                  });
                }
              }, 10000); // בדיקה כל 10 שניות
              
              // ניקוי הinterval בעת הסרת הקומפוננטה
              return () => clearInterval(intervalId);
            }
          } else {
            console.log("Payment not found in database yet");
            logNOWPaymentsOperation('info', 'התשלום עדיין לא נמצא במסד הנתונים', { 
              paymentId: transaction.invoiceId || transaction.paymentId
            });
            
            // יתכן שהתשלום זה עתה נוצר ועדיין לא עובד
            // אנו שומרים את העסקה בlocal storage לעת עתה
          }
        } catch (dbError) {
          console.error("Error querying database:", dbError);
          logNOWPaymentsOperation('error', 'שגיאה בשאילתת מסד נתונים', { 
            error: dbError instanceof Error ? dbError.message : String(dbError)
          });
          setError(`שגיאת מסד נתונים: ${dbError instanceof Error ? dbError.message : 'שגיאה לא ידועה'}`);
        } finally {
          setIsChecking(false);
        }
      } catch (parseError) {
        console.error("Error processing stored transaction:", parseError);
        logNOWPaymentsOperation('error', 'שגיאה בעיבוד עסקה מאוחסנת', { 
          error: parseError instanceof Error ? parseError.message : String(parseError)
        });
        localStorage.removeItem('nowpayments_transaction'); // מוחק עסקה פגומה
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
      logNOWPaymentsOperation('info', 'עסקה נמחקה ידנית מהאחסון המקומי');
    }
  };
};
