import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { NOWPaymentsEmbeddedFrame } from "./NOWPaymentsEmbeddedFrame";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

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
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  const createInvoice = async () => {
    setErrorMessage(null);
    
    if (!apiKey) {
      const errorMessage = "מפתח הAPI של NOWPayments לא מוגדר";
      setErrorMessage(errorMessage);
      onError?.(errorMessage);
      return;
    }
    
    setIsLoading(true);
    
    try {
      const finalOrderId = orderId.includes('_') ? orderId : orderId.replace(/-/g, '_');
      const currentUrl = window.location.href;
      
      const payload = {
        price_amount: amount,
        price_currency: 'usd',
        order_id: finalOrderId,
        order_description: description,
        ipn_callback_url: ipnCallbackUrl || null,
        success_url: currentUrl,
        cancel_url: currentUrl
      };
      
      const response = await fetch('https://api.nowpayments.io/v1/invoice', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey
        },
        body: JSON.stringify(payload)
      });
      
      if (!response.ok) {
        throw new Error('שגיאה ביצירת חשבונית');
      }
      
      const data = await response.json();
      handleSuccessResponse(data);
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'שגיאה לא ידועה';
      setErrorMessage(errorMessage);
      onError?.(errorMessage);
      setIsLoading(false);
    }
  };
  
  const handleSuccessResponse = (data: any) => {
    if (!data.invoice_url) {
      setErrorMessage('לא התקבלה כתובת תשלום תקינה');
      onError?.('לא התקבלה כתובת תשלום תקינה');
      setIsLoading(false);
      return;
    }
    
    setPaymentUrl(data.invoice_url);
    setInvoiceId(data.invoice_url);
    onSuccess?.(data);
    setIsLoading(false);
  };
  
  return (
    <div className="space-y-4">
      {errorMessage && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>שגיאה בתהליך התשלום</AlertTitle>
          <AlertDescription>{errorMessage}</AlertDescription>
        </Alert>
      )}
      
      {!invoiceId && (
        <Button
          onClick={createInvoice}
          disabled={isLoading}
          className="w-full"
          variant="outline"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              מכין את דף התשלום...
            </>
          ) : (
            'שלם באמצעות קריפטו'
          )}
        </Button>
      )}
      
      {invoiceId && (
        <NOWPaymentsEmbeddedFrame
          invoiceId={invoiceId}
          isLoading={isLoading}
        />
      )}
    </div>
  );
};
