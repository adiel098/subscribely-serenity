
import React, { useState, useEffect } from "react";
import { Loader2, AlertCircle, ExternalLink } from "lucide-react";
import { logNOWPaymentsOperation } from "../debug/NOWPaymentsLogs";
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
      console.log("[NOWPaymentsEmbeddedFrame] Rendering frame with invoiceId:", invoiceId);
      logNOWPaymentsOperation('info', `מציג מסגרת תשלום עם מזהה: ${invoiceId}`);
      setIframeLoading(true);
      setIframeError(null);
      
      // בניית URL תשלום
      let url;
      if (invoiceId.startsWith('mock')) {
        url = `https://nowpayments.io/payment/?iid=${invoiceId}`;
      } else if (invoiceId.includes('iid=')) {
        url = `https://nowpayments.io/payment/?${invoiceId}`;
      } else {
        url = `https://nowpayments.io/payment/?iid=${invoiceId}`;
      }
      
      setPaymentUrl(url);
      
      // מאפס את מצב השגיאה אחרי 15 שניות אם האייפריים לא נטען
      const timer = setTimeout(() => {
        if (iframeLoading) {
          setIframeError("האייפריים לא נטען תוך 15 שניות. ייתכן שיש חסימה של חוסם תוכן או בעיית חיבור.");
          setIframeLoading(false);
          logNOWPaymentsOperation(
            'error', 
            'תקלה בטעינת האייפריים - תם הזמן המוקצב',
            { invoiceId }
          );
        }
      }, 15000);
      
      return () => clearTimeout(timer);
    }
  }, [invoiceId]);

  const handleIframeLoad = () => {
    console.log("[NOWPaymentsEmbeddedFrame] iframe loaded successfully");
    logNOWPaymentsOperation('info', `מסגרת התשלום נטענה בהצלחה עבור: ${invoiceId}`);
    setIframeLoading(false);
    setIframeError(null);
  };
  
  const handleIframeError = () => {
    console.error("[NOWPaymentsEmbeddedFrame] iframe failed to load");
    const errorMsg = "שגיאה בטעינת מסגרת התשלום";
    logNOWPaymentsOperation('error', errorMsg, { invoiceId });
    setIframeLoading(false);
    setIframeError(errorMsg);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[300px] bg-gray-50 border rounded-lg">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-amber-500 mb-2" />
          <p className="text-gray-500">יוצר חשבונית תשלום...</p>
        </div>
      </div>
    );
  }

  if (!invoiceId) {
    return null;
  }

  // בדיקה אם מדובר במזהה תשלום או חשבונית ובניית URL בהתאם
  let iframeUrl;
  if (invoiceId.startsWith('mock')) {
    // במצב פיתוח, משתמשים בדף דמה
    iframeUrl = `https://nowpayments.io/embeds/payment-widget?iid=${invoiceId}`;
  } else if (invoiceId.includes('iid=')) {
    // אם ה-ID כבר מכיל את הפרמטר iid
    iframeUrl = `https://nowpayments.io/embeds/payment-widget?${invoiceId}`;
  } else {
    // אחרת מניחים שזהו מזהה חשבונית רגיל
    iframeUrl = `https://nowpayments.io/embeds/payment-widget?iid=${invoiceId}`;
  }

  return (
    <div className="w-full overflow-hidden rounded-lg border border-amber-200 bg-white">
      <div className="p-3 bg-amber-50 border-b border-amber-200">
        <h3 className="font-medium text-amber-800">השלם את תשלום הקריפטו</h3>
        <p className="text-sm text-amber-700">השלם את התשלום שלך בממשק המאובטח</p>
      </div>
      
      {iframeLoading && (
        <div className="flex items-center justify-center h-[200px]">
          <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
        </div>
      )}
      
      {iframeError && (
        <div className="p-4 bg-red-50 text-red-800 flex items-start">
          <AlertCircle className="h-5 w-5 mr-2 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium">שגיאה בהצגת ממשק התשלום</p>
            <p className="text-sm mt-1">{iframeError}</p>
            
            {paymentUrl && (
              <div className="mt-3">
                <Button 
                  variant="outline" 
                  size="sm"
                  className="bg-white text-red-600 border-red-200 hover:bg-red-50"
                  onClick={() => window.open(paymentUrl, '_blank')}
                >
                  <ExternalLink className="h-4 w-4 mr-1" /> פתח בחלון חדש
                </Button>
              </div>
            )}
            
            <p className="text-xs mt-3">מזהה חשבונית: {invoiceId}</p>
            <p className="text-xs">נסה לפתוח את העמוד בדפדפן חיצוני או צור קשר עם התמיכה.</p>
          </div>
        </div>
      )}
      
      <div className={`flex items-center justify-center w-full ${iframeLoading ? 'hidden' : 'block'}`}>
        <iframe 
          src={iframeUrl}
          width="100%" 
          height="500" 
          frameBorder="0" 
          scrolling="no"
          className="mx-auto block"
          style={{ overflowY: 'hidden', maxWidth: '420px' }}
          title="NOWPayments checkout"
          onLoad={handleIframeLoad}
          onError={handleIframeError}
        >
          לא ניתן לטעון את ממשק התשלום
        </iframe>
      </div>
      
      <div className="p-2 bg-amber-50 text-center text-xs text-amber-700">
        מנוע התשלום מופעל על ידי NOWPayments - מאובטח ומוגן
      </div>
    </div>
  );
};
