import React, { useState, useEffect } from 'react';
import { Trash2, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

const STORAGE_KEY = 'nowpayments_logs';
const MAX_LOGS = 20;

interface LogEntry {
  type: string;
  message: string;
  data?: any;
  timestamp: number;
}

export function logNOWPaymentsOperation(
  type: 'request' | 'response' | 'error' | 'info',
  message: string,
  data?: any
) {
  try {
    const logs = getLogs();
    
    logs.unshift({
      type,
      message,
      data,
      timestamp: Date.now()
    });
    
    // Keep only the last MAX_LOGS entries
    while (logs.length > MAX_LOGS) {
      logs.pop();
    }
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(logs));
    console.log(`[NOWPayments Log] ${type.toUpperCase()}: ${message}`, data || '');
    
    // Dispatch event to notify component to update
    window.dispatchEvent(new CustomEvent('nowpayments-log-updated'));
  } catch (e) {
    console.error('Error logging NOWPayments operation:', e);
  }
}

function getLogs(): LogEntry[] {
  try {
    const storedLogs = localStorage.getItem(STORAGE_KEY);
    return storedLogs ? JSON.parse(storedLogs) : [];
  } catch {
    return [];
  }
}

export const NOWPaymentsLogs: React.FC = () => {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  
  const loadLogs = () => {
    setLogs(getLogs());
  };
  
  const clearLogs = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([]));
    setLogs([]);
  };
  
  useEffect(() => {
    loadLogs();
    
    // Listen for log updates
    const handleUpdate = () => loadLogs();
    window.addEventListener('nowpayments-log-updated', handleUpdate);
    
    return () => {
      window.removeEventListener('nowpayments-log-updated', handleUpdate);
    };
  }, []);
  
  if (logs.length === 0) {
    return (
      <div className="text-xs p-2 bg-gray-50 rounded border">
        <div className="flex justify-between">
          <p className="text-gray-500">No NOWPayments logs available.</p>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={loadLogs}
            className="h-6 w-6 p-0"
          >
            <RefreshCw className="h-3 w-3" />
          </Button>
        </div>
      </div>
    );
  }
  
  // Format timestamp
  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString();
  };
  
  // Color for log types
  const getTypeColor = (type: string) => {
    switch (type) {
      case 'request': return 'text-blue-600';
      case 'response': return 'text-green-600';
      case 'error': return 'text-red-600';
      case 'info': return 'text-purple-600';
      default: return 'text-gray-600';
    }
  };
  
  return (
    <div className="text-xs border rounded bg-gray-50 overflow-hidden">
      <div className="flex justify-between items-center p-2 border-b bg-gray-100">
        <h4 className="font-semibold">NOWPayments Debug Logs</h4>
        <div className="flex gap-1">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={loadLogs}
            className="h-6 w-6 p-0"
          >
            <RefreshCw className="h-3 w-3" />
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={clearLogs}
            className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      </div>
      
      <div className="max-h-40 overflow-y-auto">
        {logs.map((log, index) => (
          <div 
            key={index} 
            className={`p-1.5 border-b text-xs ${index % 2 === 0 ? 'bg-white/50' : 'bg-gray-50/50'}`}
          >
            <div className="flex justify-between">
              <span className={`font-semibold uppercase ${getTypeColor(log.type)}`}>
                {log.type}
              </span>
              <span className="text-gray-500 text-xs">{formatTime(log.timestamp)}</span>
            </div>
            <div className="mt-0.5">{log.message}</div>
            {log.data && (
              <pre className="mt-1 bg-gray-100 p-1 rounded text-xs overflow-x-auto">
                {typeof log.data === 'object' 
                  ? JSON.stringify(log.data, null, 2)
                  : log.data.toString()}
              </pre>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
