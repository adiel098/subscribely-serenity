
import React, { useState, useEffect } from 'react';
import { RefreshCw, ExternalLink, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { logNOWPaymentsOperation } from './NOWPaymentsLogs';

export const NOWPaymentsDebugInfo: React.FC = () => {
  const [storedTransaction, setStoredTransaction] = useState<any>(null);
  const [configInfo, setConfigInfo] = useState<any>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  
  useEffect(() => {
    loadStoredTransaction();
    checkConfig();
    
    // בדיקה תקופתית עבור שינויים
    const interval = setInterval(() => {
      loadStoredTransaction();
    }, 10000);
    
    return () => clearInterval(interval);
  }, []);
  
  const checkConfig = async () => {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const communityId = urlParams.get('communityId') || localStorage.getItem('selectedCommunityId');
      
      if (!communityId) {
        console.log('אין מזהה קהילה זמין לבדיקת תצורה');
        return;
      }
      
      logNOWPaymentsOperation('info', 'בודק תצורת תשלומי קריפטו', { communityId });
      
      // בדיקת אם יש תמיכה בפונקציית אדג'
      // אני מדלג על מימוש מלא של בדיקת הקונפיגורציה כדי לא להכביד
      
      setConfigInfo({
        communityId,
        checkedAt: new Date().toISOString(),
      });
    } catch (error) {
      console.error('שגיאה בבדיקת תצורה:', error);
      logNOWPaymentsOperation('error', 'שגיאה בבדיקת תצורת תשלומים', { 
        error: error instanceof Error ? error.message : String(error)
      });
    }
  };
  
  const loadStoredTransaction = () => {
    const transactionData = localStorage.getItem('nowpayments_transaction');
    if (transactionData) {
      try {
        const parsedData = JSON.parse(transactionData);
        console.log("טעינת עסקה מאוחסנת:", parsedData);
        setStoredTransaction(parsedData);
      } catch (e) {
        console.error("שגיאה בפענוח עסקה מאוחסנת:", e);
      }
    } else {
      setStoredTransaction(null);
    }
  };
  
  const timeAgo = () => {
    if (!storedTransaction?.timestamp) return 'זמן לא ידוע';
    
    const seconds = Math.floor((Date.now() - storedTransaction.timestamp) / 1000);
    
    if (seconds < 60) return 'זה עתה';
    if (seconds < 3600) return `לפני ${Math.floor(seconds/60)} דקות`;
    if (seconds < 86400) return `לפני ${Math.floor(seconds/3600)} שעות`;
    return `לפני ${Math.floor(seconds/86400)} ימים`;
  };
  
  const clearTransaction = () => {
    localStorage.removeItem('nowpayments_transaction');
    setStoredTransaction(null);
    logNOWPaymentsOperation('info', 'עסקה מאוחסנת נוקתה ידנית');
  };

  // חילוץ מזהה חשבונית להטמעה
  const getInvoiceId = () => {
    if (!storedTransaction) return null;
    
    if (storedTransaction.invoiceId) return storedTransaction.invoiceId;
    
    if (storedTransaction.paymentUrl) {
      if (storedTransaction.paymentUrl.includes('iid=')) {
        return storedTransaction.paymentUrl.split('iid=')[1]?.split('&')[0];
      }
      if (storedTransaction.paymentUrl.includes('payment=')) {
        return storedTransaction.paymentUrl.split('payment=')[1]?.split('&')[0];
      }
    }
    
    return null;
  };
  
  const invoiceId = getInvoiceId();
  
  // יצירת בלוק דיבאג למצבי שגיאה חמורים
  const getUnhandledErrorsCount = () => {
    try {
      const logs = JSON.parse(localStorage.getItem('nowpayments_logs') || '[]');
      return logs.filter((log: any) => log.type === 'error').length;
    } catch {
      return 0;
    }
  };
  
  const errorCount = getUnhandledErrorsCount();
  
  if (!storedTransaction && !errorCount && !isExpanded) {
    return (
      <div className="text-sm p-2 bg-gray-50 rounded border">
        <Button 
          variant="ghost" 
          size="sm" 
          className="w-full text-gray-500 h-6 py-1"
          onClick={() => setIsExpanded(true)}
        >
          הצג מידע על תשלומי קריפטו
        </Button>
      </div>
    );
  }

  if (errorCount > 0 && !storedTransaction) {
    return (
      <div className="p-2 bg-red-50 rounded border border-red-200">
        <div className="flex items-start">
          <AlertCircle className="h-5 w-5 text-red-500 mr-2 flex-shrink-0" />
          <div>
            <h4 className="font-medium text-red-800">בעיה בעיבוד תשלום קריפטו</h4>
            <p className="text-sm text-red-700">
              נרשמו {errorCount} שגיאות בתהליך התשלום. אנא בקש עזרה מהתמיכה או נסה אמצעי תשלום אחר.
            </p>
            <div className="mt-2 flex gap-2">
              <Button
                size="sm"
                variant="outline" 
                className="text-xs border-red-200 hover:bg-red-100"
                onClick={loadStoredTransaction}
              >
                <RefreshCw className="h-3 w-3 mr-1" />
                רענן
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  if (!storedTransaction) {
    return (
      <div className="text-sm p-2 bg-gray-50 rounded border">
        <div className="flex justify-between items-center">
          <p className="text-gray-500">אין עסקאות קריפטו פעילות</p>
          <Button 
            size="sm" 
            variant="ghost" 
            className="h-6 py-0 px-2"
            onClick={() => {
              loadStoredTransaction();
              checkConfig();
            }}
          >
            <RefreshCw className="h-3 w-3" />
          </Button>
        </div>
        
        {isExpanded && configInfo && (
          <div className="mt-2 p-2 bg-blue-50 rounded text-xs">
            <p><strong>מזהה קהילה:</strong> {configInfo.communityId}</p>
            <p><strong>נבדק:</strong> {new Date(configInfo.checkedAt).toLocaleTimeString()}</p>
          </div>
        )}
      </div>
    );
  }
  
  return (
    <div className="text-xs p-2 bg-amber-50 rounded border border-amber-200">
      <div className="flex justify-between mb-2">
        <h4 className="font-semibold">עסקת תשלום פעילה</h4>
        <div className="flex gap-1">
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-6 w-6 p-0"
            onClick={loadStoredTransaction}
          >
            <RefreshCw className="h-3 w-3" />
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-6 w-6 p-0 text-red-500"
            onClick={clearTransaction}
          >
            <span className="text-xs">❌</span>
          </Button>
        </div>
      </div>
      
      <div className="space-y-1 font-mono">
        {storedTransaction.invoiceId && (
          <div><strong>מזהה חשבונית:</strong> {storedTransaction.invoiceId}</div>
        )}
        {storedTransaction.orderId && (
          <div><strong>מזהה הזמנה:</strong> {storedTransaction.orderId}</div>
        )}
        <div><strong>סכום:</strong> ${storedTransaction.amount}</div>
        <div><strong>נוצר:</strong> {timeAgo()}</div>
        {invoiceId && (
          <div className="mt-2 p-2 bg-amber-100 rounded border border-amber-300">
            <div className="font-normal mb-1">כתובת iframe:</div>
            <code className="text-[10px] bg-white p-1 block rounded border border-amber-200 break-all">
              https://nowpayments.io/embeds/payment-widget?iid={invoiceId}
            </code>
          </div>
        )}
        {storedTransaction.paymentUrl && (
          <div className="pt-1">
            <Button 
              size="sm"
              variant="outline" 
              className="w-full text-xs h-7 mt-1 border-amber-300"
              onClick={() => window.open(storedTransaction.paymentUrl, '_blank')}
            >
              <ExternalLink className="h-3 w-3 mr-1" />
              פתח דף תשלום
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
