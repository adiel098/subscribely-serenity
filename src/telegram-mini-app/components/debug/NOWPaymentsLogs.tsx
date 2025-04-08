import React, { useState, useEffect } from "react";
import { X, ChevronDown, ChevronUp, Filter, RefreshCw, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface LogEntry {
  timestamp: number;
  type: 'request' | 'response' | 'error';
  message: string;
  data?: any;
}

export const NOWPaymentsLogs: React.FC = () => {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isOpen, setIsOpen] = useState(true);
  const [filter, setFilter] = useState<'all' | 'request' | 'response' | 'error'>('all');
  
  useEffect(() => {
    // Load logs from localStorage if available
    const storedLogs = localStorage.getItem('nowpayments_logs');
    if (storedLogs) {
      try {
        setLogs(JSON.parse(storedLogs));
      } catch (e) {
        console.error("Error parsing stored logs:", e);
      }
    }
    
    // Set up event listener for custom log events
    const handleLogEvent = (event: CustomEvent) => {
      const newLog: LogEntry = event.detail;
      setLogs(prevLogs => {
        const updatedLogs = [...prevLogs, newLog];
        // Keep only last 50 logs to avoid localStorage size issues
        const trimmedLogs = updatedLogs.slice(-50);
        localStorage.setItem('nowpayments_logs', JSON.stringify(trimmedLogs));
        return trimmedLogs;
      });
    };
    
    // Listen for our custom log event
    window.addEventListener('nowpayments_log' as any, handleLogEvent);
    
    // Override fetch for api.nowpayments.io
    const originalFetch = window.fetch;
    window.fetch = async function(input: RequestInfo | URL, init?: RequestInit) {
      const url = input instanceof Request ? input.url : input.toString();
      
      if (url.includes('api.nowpayments.io')) {
        try {
          // Log the request
          const requestBody = init?.body ? JSON.parse(init.body.toString()) : null;
          const requestLog: LogEntry = {
            timestamp: Date.now(),
            type: 'request',
            message: `${init?.method || 'GET'} ${url.split('/').slice(-1)[0]}`,
            data: {
              url,
              method: init?.method,
              headers: init?.headers,
              body: requestBody
            }
          };
          
          window.dispatchEvent(new CustomEvent('nowpayments_log', { detail: requestLog }));
          
          // Execute the actual request
          const response = await originalFetch(input, init);
          
          // Clone the response to read its body
          const clonedResponse = response.clone();
          try {
            const responseData = await clonedResponse.json();
            
            // Log the response
            const responseLog: LogEntry = {
              timestamp: Date.now(),
              type: 'response',
              message: `Response: ${response.status} - ${url.split('/').slice(-1)[0]}`,
              data: responseData
            };
            
            window.dispatchEvent(new CustomEvent('nowpayments_log', { detail: responseLog }));
          } catch (e) {
            // Log error parsing response
            const errorLog: LogEntry = {
              timestamp: Date.now(),
              type: 'error',
              message: `Error parsing response from ${url}`
            };
            window.dispatchEvent(new CustomEvent('nowpayments_log', { detail: errorLog }));
          }
          
          return response;
        } catch (err) {
          // Log any fetch error
          const errorLog: LogEntry = {
            timestamp: Date.now(),
            type: 'error',
            message: `Error fetching ${url}: ${err instanceof Error ? err.message : String(err)}`
          };
          window.dispatchEvent(new CustomEvent('nowpayments_log', { detail: errorLog }));
          throw err;
        }
      }
      
      // Default behavior for non-NOWPayments requests
      return originalFetch(input, init);
    };
    
    // Clean up
    return () => {
      window.removeEventListener('nowpayments_log' as any, handleLogEvent);
      window.fetch = originalFetch;
    };
  }, []);
  
  const clearLogs = () => {
    setLogs([]);
    localStorage.removeItem('nowpayments_logs');
  };
  
  const filteredLogs = filter === 'all' ? logs : logs.filter(log => log.type === filter);
  
  const copyLogs = () => {
    const logText = JSON.stringify(filteredLogs, null, 2);
    navigator.clipboard.writeText(logText);
  };
  
  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString();
  };

  return (
    <div className="border rounded-md mb-4 overflow-hidden">
      <div className="bg-gray-100 p-2 flex justify-between items-center border-b">
        <div className="flex items-center">
          <button 
            onClick={() => setIsOpen(!isOpen)}
            className="mr-2 p-1 rounded hover:bg-gray-200"
          >
            {isOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
          <h3 className="font-medium text-sm">NOWPayments API Logs</h3>
          <Badge variant="outline" className="ml-2">
            {filteredLogs.length}
          </Badge>
        </div>
        
        <div className="flex gap-1">
          <div className="flex">
            <Button 
              variant="ghost" 
              size="sm"
              className={`px-2 py-1 text-xs ${filter === 'all' ? 'bg-gray-200' : ''}`}
              onClick={() => setFilter('all')}
            >
              All
            </Button>
            <Button 
              variant="ghost" 
              size="sm"
              className={`px-2 py-1 text-xs ${filter === 'request' ? 'bg-gray-200' : ''}`}
              onClick={() => setFilter('request')}
            >
              Requests
            </Button>
            <Button 
              variant="ghost" 
              size="sm"
              className={`px-2 py-1 text-xs ${filter === 'response' ? 'bg-gray-200' : ''}`}
              onClick={() => setFilter('response')}
            >
              Responses
            </Button>
            <Button 
              variant="ghost" 
              size="sm"
              className={`px-2 py-1 text-xs ${filter === 'error' ? 'bg-gray-200' : ''}`}
              onClick={() => setFilter('error')}
            >
              Errors
            </Button>
          </div>
          
          <Button 
            variant="ghost" 
            size="sm" 
            className="p-1" 
            onClick={copyLogs}
            title="Copy logs"
          >
            <Copy size={14} />
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            className="p-1" 
            onClick={clearLogs}
            title="Clear logs"
          >
            <X size={14} />
          </Button>
        </div>
      </div>
      
      {isOpen && (
        <div className="max-h-80 overflow-y-auto p-2 text-xs bg-gray-50">
          {filteredLogs.length === 0 ? (
            <div className="text-center py-4 text-gray-500">
              אין לוגים לתצוגה. בצע פעולת תשלום כדי לראות את הלוגים כאן.
            </div>
          ) : (
            filteredLogs.map((log, index) => (
              <div 
                key={index}
                className={`mb-2 p-2 rounded-sm ${
                  log.type === 'error' ? 'bg-red-50 border-l-2 border-red-500' : 
                  log.type === 'request' ? 'bg-blue-50 border-l-2 border-blue-500' : 
                  'bg-green-50 border-l-2 border-green-500'
                }`}
              >
                <div className="flex justify-between items-start">
                  <span className="font-mono">{formatTime(log.timestamp)}</span>
                  <Badge variant={log.type === 'error' ? 'destructive' : log.type === 'request' ? 'secondary' : 'default'}>
                    {log.type}
                  </Badge>
                </div>
                <div className="mt-1 mb-1 font-semibold">{log.message}</div>
                {log.data && (
                  <pre className="whitespace-pre-wrap bg-white p-2 rounded border text-xs overflow-x-auto mt-1">
                    {JSON.stringify(log.data, null, 2)}
                  </pre>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

// Utility function for logging NOWPayments API operations
export const logNOWPaymentsOperation = (
  type: 'request' | 'response' | 'error', 
  message: string, 
  data?: any
) => {
  const logEntry: LogEntry = {
    timestamp: Date.now(),
    type,
    message,
    data
  };
  
  window.dispatchEvent(new CustomEvent('nowpayments_log', { detail: logEntry }));
  return logEntry;
};
