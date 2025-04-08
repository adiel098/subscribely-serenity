
import React, { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

export const logNOWPaymentsOperation = (
  type: 'info' | 'error' | 'request' | 'response', 
  message: string,
  data?: any
) => {
  try {
    const timestamp = Date.now();
    console.log(`[NOWPayments] ${type.toUpperCase()} - ${message}`, data || '');
    
    // שמירה בlocal storage
    const existingLogsStr = localStorage.getItem('nowpayments_logs');
    const existingLogs = existingLogsStr ? JSON.parse(existingLogsStr) : [];
    
    // הגבלת מספר הלוגים ל-50
    const updatedLogs = [
      ...existingLogs,
      { type, message, data, timestamp }
    ].slice(-50);
    
    localStorage.setItem('nowpayments_logs', JSON.stringify(updatedLogs));
    
    // שידור אירוע אם יש מאזינים
    if (typeof window !== 'undefined') {
      const event = new CustomEvent('nowpayments_log', {
        detail: { type, message, data, timestamp }
      });
      window.dispatchEvent(event);
    }
  } catch (error) {
    console.error('Error logging NOWPayments operation:', error);
  }
};

export const NOWPaymentsLogs = () => {
  const [logs, setLogs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    // טעינת לוגים קיימים
    const loadLogs = () => {
      const existingLogsStr = localStorage.getItem('nowpayments_logs');
      if (existingLogsStr) {
        try {
          const existingLogs = JSON.parse(existingLogsStr);
          setLogs(existingLogs || []);
        } catch (error) {
          console.error('Error parsing logs:', error);
        }
      }
      setIsLoading(false);
    };
    
    loadLogs();
    
    // מאזין לאירועי לוג חדשים
    const handleNewLog = () => {
      loadLogs();
    };
    
    window.addEventListener('nowpayments_log', handleNewLog);
    
    return () => {
      window.removeEventListener('nowpayments_log', handleNewLog);
    };
  }, []);
  
  return (
    <Card className="border-indigo-200 bg-indigo-50 mt-4">
      <CardHeader className="bg-indigo-100 border-b border-indigo-200 pb-2">
        <CardTitle className="text-sm font-medium text-indigo-800">לוגים של NOWPayments</CardTitle>
      </CardHeader>
      <CardContent className="p-0 text-xs">
        {isLoading ? (
          <div className="flex justify-center items-center py-8">
            <Loader2 className="h-5 w-5 animate-spin text-indigo-500" />
          </div>
        ) : logs.length > 0 ? (
          <Accordion type="single" collapsible className="w-full">
            {logs.slice().reverse().map((log, i) => (
              <AccordionItem value={`log-${i}`} key={i} className="border-b border-indigo-100">
                <AccordionTrigger className={`px-3 py-2 text-xs hover:no-underline ${
                  log.type === 'error' ? 'text-red-700 font-medium' : 
                  log.type === 'response' ? 'text-green-700' : 'text-indigo-700'
                }`}>
                  <div className="flex items-center w-full justify-between">
                    <span className="truncate max-w-[250px]">{log.message}</span>
                    <span className="text-xs opacity-60 font-mono">
                      {new Date(log.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="p-2 bg-white">
                    <div className="mb-1 text-gray-500">
                      סוג: <span className="font-medium">{log.type}</span>
                    </div>
                    {log.data && (
                      <pre className="bg-indigo-50 p-2 rounded whitespace-pre-wrap break-all text-[10px] max-h-40 overflow-auto font-mono">
                        {typeof log.data === 'object' ? JSON.stringify(log.data, null, 2) : String(log.data)}
                      </pre>
                    )}
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        ) : (
          <div className="py-6 text-center text-gray-500">
            אין לוגים זמינים
          </div>
        )}
      </CardContent>
    </Card>
  );
};
