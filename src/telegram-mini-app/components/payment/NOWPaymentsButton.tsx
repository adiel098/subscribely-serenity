
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, ExternalLink } from "lucide-react";
import { logNOWPaymentsOperation } from "../debug/NOWPaymentsLogs";
import { NOWPaymentsEmbeddedFrame } from "./NOWPaymentsEmbeddedFrame";

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
  const [invoiceId, setInvoiceId] = useState<string | null>(null);
  
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
          invoice_id: `mock${Date.now()}`,
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
      
      // Make the API call - NOTE: USING INVOICE API ENDPOINT
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
      
      // Extract invoice ID from the URL or use the ID directly
      const invoiceIdFromUrl = data.invoice_url.split('iid=')[1]?.split('&')[0];
      const finalInvoiceId = invoiceIdFromUrl || data.id;
      
      setInvoiceId(finalInvoiceId);
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
    <div className="space-y-6">
      {!invoiceId ? (
        <Button
          onClick={createInvoice}
          disabled={isLoading}
          className="w-full bg-amber-500 hover:bg-amber-600 text-white"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              יוצר תשלום...
            </>
          ) : (
            <>שלם באמצעות קריפטו</>
          )}
        </Button>
      ) : (
        <div className="space-y-3">
          {/* Display the embedded iframe for payment */}
          <NOWPaymentsEmbeddedFrame 
            invoiceId={invoiceId} 
          />
          
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={createInvoice}
              disabled={isLoading}
              className="flex-1 border-amber-300"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  מעבד...
                </>
              ) : (
                <>צור חשבונית חדשה</>
              )}
            </Button>
            
            {paymentUrl && (
              <Button
                onClick={() => window.open(paymentUrl, '_blank')}
                className="bg-amber-500 hover:bg-amber-600 text-white"
              >
                <ExternalLink className="mr-2 h-4 w-4" />
                פתח בחלון חדש
              </Button>
            )}
          </div>
        </div>
      )}
      
      {!apiKey && (
        <p className="text-xs text-red-600 mt-2">
          תשלומי קריפטו לא מוגדרים כראוי. אנא צור קשר עם התמיכה.
        </p>
      )}
    </div>
  );
};
