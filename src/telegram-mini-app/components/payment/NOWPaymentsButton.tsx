
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, CreditCard } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

interface NOWPaymentsButtonProps {
  amount: number;
  currency?: string;
  orderId?: string;
  description?: string;
  apiKey: string;
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

export const NOWPaymentsButton = ({
  amount,
  currency = 'USD',
  orderId,
  description,
  apiKey,
  onSuccess,
  onError
}: NOWPaymentsButtonProps) => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handlePayment = async () => {
    if (!apiKey) {
      toast({
        title: 'Configuration Error',
        description: 'NOWPayments API key is not configured',
        variant: 'destructive'
      });
      
      if (onError) onError('Missing API key');
      return;
    }
    
    setLoading(true);
    try {
      // תכלס בשלב זה אנחנו צריכים לעשות קריאה לאנדפוינט שיוצר חשבונית, 
      // אבל כרגע נעשה סימולציה
      console.log('Creating NOWPayments invoice:', {
        amount,
        currency,
        orderId,
        description
      });
      
      // סימולציה: נמתין מעט ואז נעדכן על הצלחה
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast({
        title: 'Payment Initiated',
        description: 'You will be redirected to complete your crypto payment',
      });
      
      // פתיחת דף תשלום חדש או הפנייה לעמוד התשלום
      // window.open('https://nowpayments.io/payment-page', '_blank');
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error('Payment failed:', error);
      toast({
        title: 'Payment Error',
        description: 'Failed to initiate crypto payment. Please try again.',
        variant: 'destructive'
      });
      
      if (onError) {
        onError(error.message || 'Payment processing failed');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      onClick={handlePayment}
      disabled={loading}
      className="w-full bg-amber-600 hover:bg-amber-700 text-white"
    >
      {loading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Processing...
        </>
      ) : (
        <>
          <CreditCard className="mr-2 h-4 w-4" />
          Pay with Crypto
        </>
      )}
    </Button>
  );
};
