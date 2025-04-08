
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, ExternalLink } from "lucide-react";
import { logNOWPaymentsOperation } from "../debug/NOWPaymentsLogs";
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
  const [debugInfo, setDebugInfo] = useState<any>(null);
  
  // פונקצית יצירת חשבונית
  const createInvoice = async () => {
    // מאפס שגיאות קודמות
    setErrorMessage(null);
    setDebugInfo(null);
    
    if (!apiKey) {
      const errorMessage = "מפתח הAPI של NOWPayments לא מוגדר";
      logNOWPaymentsOperation('error', errorMessage);
      setErrorMessage(errorMessage);
      onError?.(errorMessage);
      return;
    }
    
    setIsLoading(true);
    try {
      // פורמט מזהה הזמנה להבטחת עקביות - שימוש בפורמט communityId_telegramUserId
      const finalOrderId = orderId.includes('_') ? orderId : orderId.replace(/-/g, '_');
      
      // קבלת הכתובת הנוכחית עבור כתובות הצלחה וביטול
      const currentUrl = window.location.href;
      
      // הכנת המטען לבקשה
      const payload = {
        price_amount: amount,
        price_currency: 'usd',
        order_id: finalOrderId,
        order_description: description,
        ipn_callback_url: ipnCallbackUrl || null,
        success_url: currentUrl,
        cancel_url: currentUrl
      };
      
      logNOWPaymentsOperation(
        'request', 
        `יוצר חשבונית NOWPayments עבור ${amount} USD`, 
        {
          payload,
          endpoint: 'https://api.nowpayments.io/v1/invoice',
          apiKeyPresent: !!apiKey,
          apiKeyLength: apiKey?.length
        }
      );
      
      // במצב פיתוח או כשחסר מפתח API, מחזיר תשובה מזויפת
      if (process.env.NODE_ENV === 'development' || !apiKey) {
        console.log('[NOWPayments] מצב פיתוח או מפתח API חסר - מחזיר חשבונית מזויפת');
        
        // תשובה מזויפת לבדיקות פיתוח
        const mockResponse = {
          id: `mock-${Math.random().toString(36).substring(2, 10)}`,
          invoice_url: `https://nowpayments.io/payment/?iid=mock${Date.now()}`,
          invoice_id: `mock${Date.now()}`,
          order_id: finalOrderId,
          price_amount: amount,
          price_currency: 'usd',
        };
        
        // מדמה עיכוב רשת
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // מעבד תשובה מזויפת
        handleSuccessResponse(mockResponse);
        return;
      }
      
      try {
        // מבצע את קריאת ה-API - שימוש בAPI של חשבוניות
        const response = await fetch('https://api.nowpayments.io/v1/invoice', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': apiKey
          },
          body: JSON.stringify(payload)
        });
        
        // התמודדות עם תשובות שאינן JSON
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
          const text = await response.text();
          const errorMsg = `NOWPayments API החזיר תוכן שאינו JSON: ${response.status} ${response.statusText}`;
          logNOWPaymentsOperation(
            'error',
            errorMsg,
            { contentType, responseText: text }
          );
          throw new Error(`תשובה לא תקינה מAPI של NOWPayments: ${text.substring(0, 100)}`);
        }
        
        const data = await response.json();
        
        // רישום התשובה
        logNOWPaymentsOperation(
          'response',
          `תשובת NOWPayments API: ${response.status} ${response.statusText}`,
          data
        );
        
        if (!response.ok) {
          const errorMessage = data.message || 'נכשל ביצירת חשבונית';
          logNOWPaymentsOperation('error', errorMessage, data);
          throw new Error(errorMessage);
        }
        
        handleSuccessResponse(data);
      } catch (requestError) {
        // שגיאת רשת או פארסינג
        console.error("שגיאת בקשת NOWPayments:", requestError);
        logNOWPaymentsOperation(
          'error',
          `שגיאת רשת בעת יצירת חשבונית: ${requestError instanceof Error ? requestError.message : String(requestError)}`,
          { requestError }
        );
        
        // מנסה שיטה חלופית - API תשלום ישיר
        try {
          logNOWPaymentsOperation(
            'request', 
            'מנסה ליצור תשלום ישיר כמוצא אחרון',
            { endpoint: 'https://api.nowpayments.io/v1/payment' }
          );
          
          const paymentResponse = await fetch('https://api.nowpayments.io/v1/payment', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'x-api-key': apiKey
            },
            body: JSON.stringify({
              ...payload,
              price_amount: amount,
              pay_currency: 'btc'
            })
          });
          
          if (!paymentResponse.ok) {
            const errorText = await paymentResponse.text();
            throw new Error(`שגיאת API תשלום: ${paymentResponse.status} ${paymentResponse.statusText} - ${errorText}`);
          }
          
          const paymentData = await paymentResponse.json();
          logNOWPaymentsOperation('response', 'קיבלנו תשובת תשלום ישיר', paymentData);
          
          // מטפל בתשובת תשלום
          if (paymentData.payment_url) {
            handleSuccessResponse({
              id: paymentData.payment_id,
              invoice_url: paymentData.payment_url,
              payment_id: paymentData.payment_id,
              order_id: finalOrderId,
              price_amount: amount,
              price_currency: 'usd',
            });
          } else {
            throw new Error('חסר URL לתשלום בתשובה');
          }
        } catch (paymentError) {
          // שתי השיטות נכשלו
          console.error("שגיאת תשלום ישיר:", paymentError);
          const errorMsg = `נכשלו כל ניסיונות התשלום: ${paymentError instanceof Error ? paymentError.message : String(paymentError)}`;
          logNOWPaymentsOperation('error', errorMsg);
          
          // שומר מידע נוסף לדיבאג
          setDebugInfo({
            requestError: requestError instanceof Error ? requestError.message : String(requestError),
            paymentError: paymentError instanceof Error ? paymentError.message : String(paymentError),
            apiKeyStatus: apiKey ? 'קיים' : 'חסר',
            apiKeyLength: apiKey?.length,
            ipnUrl: ipnCallbackUrl || 'לא מוגדר',
            orderId: finalOrderId
          });
          
          setErrorMessage(errorMsg);
          onError?.(errorMsg);
        }
      }
    } catch (error) {
      console.error("שגיאת NOWPayments:", error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      logNOWPaymentsOperation('error', `יצירת חשבונית נכשלה: ${errorMessage}`);
      setErrorMessage(errorMessage);
      onError?.(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };
  
  // טיפול בתשובה מוצלחת
  const handleSuccessResponse = (data: any) => {
    if (data.invoice_url || data.payment_url) {
      const url = data.invoice_url || data.payment_url;
      logNOWPaymentsOperation(
        'response', 
        `URL לתשלום התקבל: ${url}`, 
        { invoiceId: data.id || data.payment_id, orderId: data.order_id }
      );
      
      setPaymentUrl(url);
      
      // חילוץ מזהה חשבונית מה-URL או שימוש במזהה ישירות
      const invoiceIdFromUrl = url.split('iid=')[1]?.split('&')[0] || url.split('payment=')[1]?.split('&')[0];
      const finalInvoiceId = invoiceIdFromUrl || data.id || data.payment_id;
      
      setInvoiceId(finalInvoiceId);
      onSuccess?.(data);
      
      // שומר נתוני עסקה ב-localStorage
      localStorage.setItem('nowpayments_transaction', JSON.stringify({
        invoiceId: data.id || data.payment_id,
        orderId: data.order_id,
        amount: data.price_amount,
        timestamp: Date.now(),
        paymentUrl: url
      }));
    } else {
      const errorMessage = 'לא התקבלה כתובת URL לחשבונית';
      logNOWPaymentsOperation('error', errorMessage, data);
      setErrorMessage(errorMessage);
      onError?.(errorMessage);
    }
  };
  
  return (
    <div className="space-y-6">
      {errorMessage && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>שגיאה בעיבוד תשלום הקריפטו</AlertTitle>
          <AlertDescription>
            {errorMessage}
            
            {debugInfo && (
              <div className="mt-2 text-xs">
                <details>
                  <summary className="cursor-pointer">מידע לדיבאג</summary>
                  <pre className="mt-2 p-2 bg-red-50 whitespace-pre-wrap break-words">
                    {JSON.stringify(debugInfo, null, 2)}
                  </pre>
                </details>
              </div>
            )}
          </AlertDescription>
        </Alert>
      )}
      
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
            <>שלם עם קריפטו</>
          )}
        </Button>
      ) : (
        <div className="space-y-3">
          {/* מציג את האייפריים המוטמע לתשלום */}
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
          תשלומי קריפטו אינם מוגדרים כראוי. אנא צור קשר עם התמיכה.
        </p>
      )}
    </div>
  );
};
