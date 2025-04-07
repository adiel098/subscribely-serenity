
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, CreditCard } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { NOWPaymentsClient } from '@/integrations/nowpayments/client';

interface NOWPaymentsButtonProps {
  amount: number;
  currency?: string;
  orderId?: string;
  description?: string;
  apiKey: string;
  ipnCallbackUrl?: string;
  onSuccess?: (paymentData: any) => void;
  onError?: (error: string) => void;
}

export const NOWPaymentsButton = ({
  amount,
  currency = 'USD',
  orderId,
  description = 'Telegram Group Subscription',
  apiKey,
  ipnCallbackUrl,
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
      // Create NOWPayments client
      const client = new NOWPaymentsClient(apiKey);
      console.log('Creating NOWPayments invoice:', {
        amount,
        currency,
        orderId,
        description
      });
      
      // Create payment invoice
      const paymentData = await client.createPayment({
        priceAmount: amount,
        priceCurrency: currency,
        orderId: orderId || `order-${Date.now()}`,
        orderDescription: description,
        ipnCallbackUrl
      });
      
      console.log('NOWPayments invoice created:', paymentData);
      
      // Open payment URL in new tab if available
      if (paymentData.payment_url) {
        window.open(paymentData.payment_url, '_blank');
      }
      
      toast({
        title: 'Payment Initiated',
        description: 'You will be redirected to complete your crypto payment',
      });
      
      if (onSuccess) {
        onSuccess(paymentData);
      }
    } catch (error) {
      console.error('NOWPayments error:', error);
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
