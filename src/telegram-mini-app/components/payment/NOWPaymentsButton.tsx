
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, ExternalLink } from "lucide-react";
import { logNOWPaymentsOperation } from "../debug/NOWPaymentsLogs";

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
      const errorMessage = "NOWPayments API key is not configured";
      logNOWPaymentsOperation('error', errorMessage);
      onError?.(errorMessage);
      return;
    }
    
    setIsLoading(true);
    try {
      // Prepare request payload
      const payload = {
        price_amount: amount,
        price_currency: 'usd',
        pay_currency: 'btc',
        order_id: orderId,
        order_description: description,
        ipn_callback_url: ipnCallbackUrl || null
      };
      
      // Log the request
      logNOWPaymentsOperation(
        'request', 
        `Creating NOWPayments payment for ${amount} USD`, 
        {
          payload,
          endpoint: 'https://api.nowpayments.io/v1/payment',
          apiKeyPresent: !!apiKey,
          apiKeyLength: apiKey?.length
        }
      );
      
      const response = await fetch('https://api.nowpayments.io/v1/payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey
        },
        body: JSON.stringify(payload)
      });
      
      const data = await response.json();
      
      // Log the response
      logNOWPaymentsOperation(
        'response',
        `NOWPayments API response: ${response.status} ${response.statusText}`,
        data
      );
      
      console.log("NOWPayments payment response:", data);
      
      if (!response.ok) {
        const errorMessage = data.message || 'Failed to create payment';
        logNOWPaymentsOperation('error', errorMessage, data);
        throw new Error(errorMessage);
      }
      
      if (data.payment_url) {
        logNOWPaymentsOperation(
          'response', 
          `Payment URL received: ${data.payment_url}`, 
          { paymentId: data.payment_id, status: data.payment_status }
        );
        
        setPaymentUrl(data.payment_url);
        onSuccess?.(data);
        
        // Save transaction data to localStorage
        localStorage.setItem('nowpayments_transaction', JSON.stringify({
          paymentId: data.payment_id,
          status: data.payment_status,
          amount: data.price_amount,
          timestamp: Date.now(),
          paymentUrl: data.payment_url
        }));
        
        // Open payment page in new tab
        window.open(data.payment_url, '_blank');
      } else {
        const errorMessage = 'No payment URL received';
        logNOWPaymentsOperation('error', errorMessage, data);
        throw new Error(errorMessage);
      }
    } catch (error) {
      console.error("NOWPayments error:", error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      logNOWPaymentsOperation('error', `Payment creation failed: ${errorMessage}`);
      onError?.(errorMessage);
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
