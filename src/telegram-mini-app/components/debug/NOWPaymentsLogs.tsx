
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Trash2, Clock, AlertCircle, CheckCircle, RefreshCw, CircleHelp } from 'lucide-react';

// גודל מקסימלי של היסטוריית הלוגים
const MAX_LOG_HISTORY = 50;

// שומר את הלוגים בזיכרון כך שהם לא יאבדו בין רינדורים
let logHistory: {
  type: 'info' | 'error' | 'request' | 'response';
  message: string;
  timestamp: Date;
  data?: any;
}[] = [];

// פונקציה לרישום פעולות שקשורות ל-NOWPayments
export const logNOWPaymentsOperation = (
  type: 'info' | 'error' | 'request' | 'response',
  message: string,
  data?: any
) => {
  console.log(`[NOWPayments ${type}]`, message, data || '');
  
  // מוסיף את הלוג להיסטוריה
  logHistory.unshift({
    type,
    message,
    timestamp: new Date(),
    data: data || undefined
  });
  
  // שומר על גודל מקסימלי של היסטוריה
  if (logHistory.length > MAX_LOG_HISTORY) {
    logHistory = logHistory.slice(0, MAX_LOG_HISTORY);
  }
  
  // נשמור את הלוגים האחרונים בלוקל סטורג' כדי שנוכל לראות אותם גם אחרי רענון הדף
  try {
    localStorage.setItem('nowpayments_logs', JSON.stringify(logHistory));
  } catch (e) {
    console.error('Error saving logs to localStorage', e);
  }

  // שולח שגיאות חמורות לשרת
  if (type === 'error') {
    try {
      fetch('/api/log-error', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          source: 'nowpayments',
          message,
          data,
          timestamp: new Date().toISOString()
        })
      }).catch(() => {
        // לא עושים כלום אם השליחה נכשלת
      });
    } catch (e) {
      // לא עושים כלום עם שגיאות כדי למנוע לולאת שגיאות
    }
  }

  // מפעיל קוסטום איוונט שקומפוננטת הלוגים יכולה להאזין לו
  try {
    window.dispatchEvent(new CustomEvent('nowpayments_log_update', {
      detail: { type, message, data }
    }));
  } catch (e) {
    // לא עושים כלום עם שגיאות
  }
};

export const NOWPaymentsLogs = () => {
  const [logs, setLogs] = useState<typeof logHistory>([]);
  
  // טוען לוגים שמורים והאזנה לאירוע עדכון לוגים
  useEffect(() => {
    // טוען לוגים קיימים
    try {
      const savedLogs = localStorage.getItem('nowpayments_logs');
      if (savedLogs) {
        const parsedLogs = JSON.parse(savedLogs);
        // ממיר את הטיימסטאמפ בחזרה לאובייקט תאריך
        parsedLogs.forEach((log: any) => {
          log.timestamp = new Date(log.timestamp);
        });
        logHistory = parsedLogs;
      }
    } catch (e) {
      console.error('Error loading logs from localStorage', e);
    }
    
    setLogs([...logHistory]);
    
    // מאזין לאירועי לוג חדשים
    const handleLogUpdate = () => {
      setLogs([...logHistory]);
    };
    
    window.addEventListener('nowpayments_log_update', handleLogUpdate);
    return () => {
      window.removeEventListener('nowpayments_log_update', handleLogUpdate);
    };
  }, []);
  
  const clearLogs = () => {
    logHistory = [];
    localStorage.removeItem('nowpayments_logs');
    setLogs([]);
  };
  
  // מציג אייקון מתאים לסוג הלוג
  const getLogIcon = (type: string) => {
    switch (type) {
      case 'error': return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'info': return <CircleHelp className="h-4 w-4 text-blue-500" />;
      case 'request': return <RefreshCw className="h-4 w-4 text-purple-500" />;
      case 'response': return <CheckCircle className="h-4 w-4 text-green-500" />;
      default: return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  if (logs.length === 0) {
    return (
      <div className="text-sm p-2 bg-gray-50 rounded border text-center text-gray-500">
        אין לוגים של תשלומי קריפטו זמינים
      </div>
    );
  }

  return (
    <div className="text-xs">
      <div className="flex justify-between items-center mb-2">
        <h4 className="font-semibold text-sm">לוגים של תשלומי קריפטו ({logs.length})</h4>
        <Button size="sm" variant="outline" className="h-6 py-0 px-2" onClick={clearLogs}>
          <Trash2 className="h-3 w-3 mr-1" /> נקה הכל
        </Button>
      </div>
      
      <div className="max-h-48 overflow-y-auto border rounded">
        {logs.map((log, i) => (
          <div 
            key={i} 
            className={`p-1 border-b text-sm ${
              log.type === 'error' ? 'bg-red-50' : 
              log.type === 'response' ? 'bg-green-50' : 
              log.type === 'request' ? 'bg-purple-50' : 'bg-blue-50'
            }`}
          >
            <div className="flex items-start">
              <span className="mr-1 mt-1 flex-shrink-0">{getLogIcon(log.type)}</span>
              <div>
                <div className="flex items-center">
                  <span className={`font-medium ${
                    log.type === 'error' ? 'text-red-700' : 
                    log.type === 'response' ? 'text-green-700' : 
                    log.type === 'request' ? 'text-purple-700' : 'text-blue-700'
                  }`}>
                    {log.message}
                  </span>
                </div>
                <div className="text-xs text-gray-500">
                  {log.timestamp.toLocaleTimeString()}
                </div>
                {log.data && (
                  <div className="text-xs bg-white/70 rounded p-1 mt-1 overflow-x-auto max-w-full">
                    <pre className="whitespace-pre-wrap break-words">
                      {typeof log.data === 'string' 
                        ? log.data 
                        : JSON.stringify(log.data, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
