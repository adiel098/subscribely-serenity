
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
  
  // Create invoice function
  const createInvoice = async () => {
    if (!apiKey) {
      const errorMessage = "NOWPayments API key is not configured";
      logNOWPaymentsOperation('error', errorMessage);
      onError?.(errorMessage);
      return;
    }
    
    setIsLoading(true);
    try {
      // Format order ID to ensure consistency - use communityId_telegramUserId format
      // If orderId already contains underscores, assume it's already in the correct format
      const finalOrderId = orderId.includes('_') ? orderId : orderId.replace(/-/g, '_');
      
      // Get the current URL for success and cancel URLs
      const currentUrl = window.location.href;
      
      // Prepare request payload
      const payload = {
        price_amount: amount,
        price_currency: 'usd',
        order_id: finalOrderId,
        order_description: description,
        ipn_callback_url: ipnCallbackUrl || null,
        success_url: currentUrl,
        cancel_url: currentUrl
      };
      
      // Log the request
      logNOWPaymentsOperation(
        'request', 
        `Creating NOWPayments invoice for ${amount} USD`, 
        {
          payload,
          endpoint: 'https://api.nowpayments.io/v1/invoice',
          apiKeyPresent: !!apiKey,
          apiKeyLength: apiKey?.length
        }
      );
      
      // In development, mock the response
      if (process.env.NODE_ENV === 'development' || !apiKey) {
        console.log('[NOWPayments] Development mode or missing API key - returning mock invoice');
        
        // Mock response for development testing
        const mockResponse = {
          id: `mock-${Math.random().toString(36).substring(2, 10)}`,
          invoice_url: `https://nowpayments.io/payment/?iid=mock${Date.now()}`,
          order_id: finalOrderId,
          price_amount: amount,
          price_currency: 'usd',
        };
        
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // Process mock response
        handleSuccessResponse(mockResponse);
        return;
      }
      
      // Make the API call
      const response = await fetch('https://api.nowpayments.io/v1/invoice', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey
        },
        body: JSON.stringify(payload)
      });
      
      // Handle non-JSON responses
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        logNOWPaymentsOperation(
          'error',
          `NOWPayments API responded with non-JSON content: ${response.status} ${response.statusText}`,
          { contentType, responseText: text }
        );
        throw new Error(`Invalid response from NOWPayments API: ${text.substring(0, 100)}`);
      }
      
      const data = await response.json();
      
      // Log the response
      logNOWPaymentsOperation(
        'response',
        `NOWPayments API response: ${response.status} ${response.statusText}`,
        data
      );
      
      if (!response.ok) {
        const errorMessage = data.message || 'Failed to create invoice';
        logNOWPaymentsOperation('error', errorMessage, data);
        throw new Error(errorMessage);
      }
      
      handleSuccessResponse(data);
      
    } catch (error) {
      console.error("NOWPayments error:", error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      logNOWPaymentsOperation('error', `Invoice creation failed: ${errorMessage}`);
      onError?.(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle successful invoice creation
  const handleSuccessResponse = (data: any) => {
    if (data.invoice_url) {
      logNOWPaymentsOperation(
        'response', 
        `Invoice URL received: ${data.invoice_url}`, 
        { invoiceId: data.id, orderId: data.order_id }
      );
      
      setPaymentUrl(data.invoice_url);
      onSuccess?.(data);
      
      // Save transaction data to localStorage
      localStorage.setItem('nowpayments_transaction', JSON.stringify({
        invoiceId: data.id,
        orderId: data.order_id,
        amount: data.price_amount,
        timestamp: Date.now(),
        paymentUrl: data.invoice_url
      }));
    } else {
      const errorMessage = 'No invoice URL received';
      logNOWPaymentsOperation('error', errorMessage, data);
      onError?.(errorMessage);
    }
  };
  
  return (
    <div className="space-y-2">
      {!paymentUrl ? (
        <Button
          onClick={createInvoice}
          disabled={isLoading}
          className="w-full bg-amber-500 hover:bg-amber-600 text-white"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creating payment...
            </>
          ) : (
            <>Pay with Crypto</>
          )}
        </Button>
      ) : (
        <div className="space-y-3">
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
            <h4 className="font-medium mb-2">Payment Invoice Created!</h4>
            <p className="text-sm text-amber-800 mb-3">
              Click the button below to open the payment page in a new window, then return here after completing your payment.
            </p>
            
            <Button
              onClick={() => window.open(paymentUrl, '_blank')}
              className="w-full bg-amber-500 hover:bg-amber-600 text-white"
            >
              <ExternalLink className="mr-2 h-4 w-4" />
              Open Payment Page
            </Button>
          </div>
          
          <Button
            variant="outline"
            onClick={createInvoice}
            disabled={isLoading}
            className="w-full border-amber-300"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              <>Create New Invoice</>
            )}
          </Button>
        </div>
      )}
      
      {!apiKey && (
        <p className="text-xs text-red-600 mt-2">
          Crypto payment is not fully configured. Please contact support.
        </p>
      )}
    </div>
  );
};
