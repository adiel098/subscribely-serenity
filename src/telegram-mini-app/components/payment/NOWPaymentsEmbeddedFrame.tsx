import React, { useState, useEffect } from "react";
import { Loader2, AlertCircle, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

interface NOWPaymentsEmbeddedFrameProps {
  invoiceId: string | null;
  isLoading?: boolean;
}

export const NOWPaymentsEmbeddedFrame: React.FC<NOWPaymentsEmbeddedFrameProps> = ({
  invoiceId,
  isLoading = false
}) => {
  const [iframeLoading, setIframeLoading] = useState(true);
  const [iframeError, setIframeError] = useState<string | null>(null);
  const [paymentUrl, setPaymentUrl] = useState<string | null>(null);
  
  useEffect(() => {
    if (invoiceId) {
      setIframeLoading(true);
      setIframeError(null);
      setPaymentUrl(invoiceId);
      
      const timer = setTimeout(() => {
        if (iframeLoading) {
          setIframeError("לא ניתן לטעון את דף התשלום. אנא נסה שוב או פתח בחלון חדש.");
          setIframeLoading(false);
        }
      }, 15000);
      
      return () => clearTimeout(timer);
    }
  }, [invoiceId]);

  const handleIframeLoad = () => {
    setIframeLoading(false);
    setIframeError(null);
  };
  
  const handleIframeError = () => {
    setIframeLoading(false);
    setIframeError("שגיאה בטעינת דף התשלום");
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[300px] bg-gray-50 rounded-lg border border-gray-200">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary mb-2" />
          <p className="text-gray-500">מכין את דף התשלום...</p>
        </div>
      </div>
    );
  }

  if (!invoiceId) {
    return null;
  }

  return (
    <div className="w-full bg-white rounded-lg shadow-sm overflow-hidden">
      <div className="p-4 bg-gradient-to-r from-amber-50 to-orange-50 border-b">
        <h3 className="text-base font-semibold text-gray-900 mb-1">
          תשלום באמצעות קריפטו
        </h3>
        <p className="text-sm text-gray-600">
          בחר את המטבע המועדף עליך לתשלום מבין מגוון האפשרויות
        </p>
      </div>
      
      <div className="relative">
        {iframeLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-90 z-10">
            <div className="text-center">
              <Loader2 className="h-6 w-6 animate-spin mx-auto text-primary mb-2" />
              <p className="text-sm text-gray-600">טוען את אפשרויות התשלום...</p>
            </div>
          </div>
        )}
        
        {iframeError ? (
          <div className="p-6 text-center">
            <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-3" />
            <h4 className="text-base font-medium text-gray-900 mb-2">{iframeError}</h4>
            
            {paymentUrl && (
              <Button
                variant="outline"
                size="lg"
                className="mt-4 w-full sm:w-auto"
                onClick={() => window.open(paymentUrl, '_blank')}
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                המשך לדף התשלום
              </Button>
            )}
          </div>
        ) : (
          <iframe
            src={invoiceId}
            className="w-full h-[600px] border-0"
            onLoad={handleIframeLoad}
            onError={handleIframeError}
            allow="payment"
          />
        )}
      </div>
      
      <div className="p-3 bg-gray-50 border-t text-center">
        <p className="text-xs text-gray-500">
          מאובטח על ידי NOWPayments - פתרון תשלומי קריפטו מוביל
        </p>
      </div>
    </div>
  );
};
