
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, CreditCard, Bug } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { NOWPaymentsClient } from '@/integrations/nowpayments/client';
import { createLogger } from '@/telegram-mini-app/utils/debugUtils';

const logger = createLogger('NOWPaymentsButton');

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
  const [debugInfo, setDebugInfo] = useState<{
    lastAttempt: Date | null;
    apiKeyPresent: boolean;
    error: string | null;
    response: any | null;
  }>({
    lastAttempt: null,
    apiKeyPresent: !!apiKey,
    error: null,
    response: null
  });
  const [showDebug, setShowDebug] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    setDebugInfo(prev => ({
      ...prev,
      apiKeyPresent: !!apiKey
    }));
  }, [apiKey]);

  const handlePayment = async () => {
    // Update debug info at start
    setDebugInfo(prev => ({
      ...prev,
      lastAttempt: new Date(),
      error: null,
      response: null
    }));
    
    if (!apiKey) {
      const errorMsg = 'NOWPayments API key is not configured';
      setDebugInfo(prev => ({
        ...prev,
        error: errorMsg
      }));
      
      toast({
        title: 'Configuration Error',
        description: errorMsg,
        variant: 'destructive'
      });
      
      if (onError) onError(errorMsg);
      return;
    }
    
    setLoading(true);
    try {
      logger.log('Creating NOWPayments invoice:', {
        amount,
        currency,
        orderId,
        description,
        apiKeyPresent: !!apiKey
      });
      
      // Create NOWPayments client
      const client = new NOWPaymentsClient(apiKey);
      
      // Create payment invoice
      const paymentData = await client.createPayment({
        priceAmount: amount,
        priceCurrency: currency,
        orderId: orderId || `order-${Date.now()}`,
        orderDescription: description,
        ipnCallbackUrl
      });
      
      logger.log('NOWPayments invoice created:', paymentData);
      setDebugInfo(prev => ({
        ...prev,
        response: paymentData
      }));
      
      // Store transaction data for status checking
      localStorage.setItem('nowpayments_transaction', JSON.stringify({
        paymentId: paymentData.payment_id,
        status: paymentData.payment_status,
        amount: paymentData.price_amount,
        timestamp: Date.now()
      }));
      
      // Open payment URL in new tab if available
      if (paymentData.payment_url) {
        window.open(paymentData.payment_url, '_blank');
        
        toast({
          title: 'Payment Initiated',
          description: 'You will be redirected to complete your crypto payment',
        });
      } else {
        throw new Error('Payment URL not returned from NOWPayments');
      }
      
      if (onSuccess) {
        onSuccess(paymentData);
      }
    } catch (error) {
      console.error('NOWPayments error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      
      setDebugInfo(prev => ({
        ...prev,
        error: errorMessage
      }));
      
      toast({
        title: 'Payment Error',
        description: 'Failed to initiate crypto payment. Please try again.',
        variant: 'destructive'
      });
      
      if (onError) {
        onError(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
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
      
      <div className="flex justify-end">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => setShowDebug(!showDebug)}
          className="text-xs text-gray-500"
        >
          <Bug className="h-3 w-3 mr-1" />
          Debug
        </Button>
      </div>
      
      {showDebug && (
        <div className="mt-2 p-3 bg-gray-100 rounded-md text-xs border border-gray-300">
          <h4 className="font-bold mb-1">Debug Information:</h4>
          <div className="space-y-1">
            <p><strong>API Key Present:</strong> {debugInfo.apiKeyPresent ? '✅ Yes' : '❌ No'}</p>
            <p><strong>Last Attempt:</strong> {debugInfo.lastAttempt ? debugInfo.lastAttempt.toLocaleString() : 'None'}</p>
            <p><strong>Amount:</strong> {amount} {currency}</p>
            <p><strong>Order ID:</strong> {orderId || 'Will be auto-generated'}</p>
            {debugInfo.error && (
              <div className="mt-1 p-2 bg-red-100 border border-red-300 rounded">
                <p className="font-semibold text-red-700">Error:</p>
                <p className="break-all">{debugInfo.error}</p>
              </div>
            )}
            {debugInfo.response && (
              <div className="mt-1">
                <p className="font-semibold">Response:</p>
                <div className="p-2 bg-green-50 border border-green-200 rounded overflow-auto max-h-32">
                  <pre className="whitespace-pre-wrap break-all">
                    {JSON.stringify(debugInfo.response, null, 2)}
                  </pre>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
