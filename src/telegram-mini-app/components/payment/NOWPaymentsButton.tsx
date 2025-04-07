
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, ExternalLink } from "lucide-react";

interface NOWPaymentsButtonProps {
  amount: number;
  apiKey: string;
  ipnCallbackUrl?: string;
  orderId: string;
  description: string;
  onSuccess?: (paymentData: any) => void;
  onError?: (error: string) => void;
}

export const NOWPaymentsButton: React.FC<NOWPaymentsButtonProps> = ({
  amount,
  apiKey,
  ipnCallbackUrl,
  orderId,
  description,
  onSuccess,
  onError
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [paymentUrl, setPaymentUrl] = useState<string | null>(null);
  
  // Create payment function
  const createPayment = async () => {
    if (!apiKey) {
      onError?.("NOWPayments API key is not configured");
      return;
    }
    
    setIsLoading(true);
    try {
      const response = await fetch('https://api.nowpayments.io/v1/payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey
        },
        body: JSON.stringify({
          price_amount: amount,
          price_currency: 'usd',
          pay_currency: 'btc',
          order_id: orderId,
          order_description: description,
          ipn_callback_url: ipnCallbackUrl || null
        })
      });
      
      const data = await response.json();
      console.log("NOWPayments payment response:", data);
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to create payment');
      }
      
      if (data.payment_url) {
        setPaymentUrl(data.payment_url);
        onSuccess?.(data);
        
        // Open payment page in new tab
        window.open(data.payment_url, '_blank');
      } else {
        throw new Error('No payment URL received');
      }
    } catch (error) {
      console.error("NOWPayments error:", error);
      onError?.(error instanceof Error ? error.message : String(error));
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="space-y-2">
      <Button
        onClick={createPayment}
        disabled={isLoading || !apiKey}
        className="w-full bg-amber-500 hover:bg-amber-600 text-white"
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Processing...
          </>
        ) : (
          <>Pay with Crypto</>
        )}
      </Button>
      
      {paymentUrl && (
        <Button
          variant="outline"
          onClick={() => window.open(paymentUrl!, '_blank')}
          className="w-full mt-2 border-amber-300"
        >
          <ExternalLink className="mr-2 h-4 w-4" />
          Open Payment Page
        </Button>
      )}
      
      {!apiKey && (
        <p className="text-xs text-red-600 mt-2">
          Crypto payment is not fully configured. Please contact support.
        </p>
      )}
    </div>
  );
};
