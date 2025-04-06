import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { NOWPaymentsClient } from '@/integrations/nowpayments/client';
import { useToast } from '@/components/ui/use-toast';

interface NOWPaymentsButtonProps {
  amount: number;
  currency?: string;
  orderId?: string;
  description?: string;
  apiKey: string;
  onSuccess?: () => void;
}

export const NOWPaymentsButton = ({
  amount,
  currency = 'USD',
  orderId,
  description,
  apiKey,
  onSuccess
}: NOWPaymentsButtonProps) => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const client = new NOWPaymentsClient(apiKey);

  const handlePayment = async () => {
    setLoading(true);
    try {
      const payment = await client.createPayment({
        priceAmount: amount,
        priceCurrency: currency,
        orderId,
        orderDescription: description
      });

      // פתיחת חלון תשלום או הפניה לדף התשלום
      if (payment.payment_url) {
        window.open(payment.payment_url, '_blank');
      } else {
        throw new Error('No payment URL received');
      }

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
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      onClick={handlePayment}
      disabled={loading}
      className="w-full"
      variant="outline"
    >
      {loading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Processing...
        </>
      ) : (
        'Pay with Crypto'
      )}
    </Button>
  );
};
