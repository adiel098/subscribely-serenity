
import React, { useState, useEffect } from 'react';
import { ScrollArea } from "@/components/ui/scroll-area";
import { X } from "lucide-react";

interface LogEntry {
  timestamp: Date;
  message: string;
  type: 'info' | 'warning' | 'error' | 'success';
}

export const UILogger: React.FC = () => {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isVisible, setIsVisible] = useState(false);
  
  useEffect(() => {
    // Override console methods to capture logs
    const originalLog = console.log;
    const originalWarn = console.warn;
    const originalError = console.error;
    
    console.log = (...args) => {
      originalLog(...args);
      addLogEntry('info', args.map(arg => 
        typeof arg === 'object' ? JSON.stringify(arg) : String(arg)
      ).join(' '));
    };
    
    console.warn = (...args) => {
      originalWarn(...args);
      addLogEntry('warning', args.map(arg => 
        typeof arg === 'object' ? JSON.stringify(arg) : String(arg)
      ).join(' '));
    };
    
    console.error = (...args) => {
      originalError(...args);
      addLogEntry('error', args.map(arg => 
        typeof arg === 'object' ? JSON.stringify(arg) : String(arg)
      ).join(' '));
    };
    
    // Create a custom success log method
    (console as any).success = (...args: any[]) => {
      originalLog('%c✅', 'color: green', ...args);
      addLogEntry('success', args.map(arg => 
        typeof arg === 'object' ? JSON.stringify(arg) : String(arg)
      ).join(' '));
    };
    
    return () => {
      // Restore original console methods
      console.log = originalLog;
      console.warn = originalWarn;
      console.error = originalError;
      delete (console as any).success;
    };
  }, []);
  
  const addLogEntry = (type: 'info' | 'warning' | 'error' | 'success', message: string) => {
    setLogs(prev => [...prev, { timestamp: new Date(), message, type }]);
  };
  
  const toggleVisibility = () => {
    setIsVisible(!isVisible);
  };
  
  const clearLogs = () => {
    setLogs([]);
  };
  
  if (!window.location.href.includes('debug=true')) {
    return null;
  }
  
  return (
    <>
      {/* Toggle Button */}
      <button 
        onClick={toggleVisibility}
        className="fixed bottom-4 right-4 bg-primary text-white rounded-full w-12 h-12 flex items-center justify-center shadow-lg z-50"
      >
        {isVisible ? 'X' : '📋'}
      </button>
      
      {/* Log Console */}
      {isVisible && (
        <div className="fixed bottom-20 right-4 w-[90vw] max-w-md h-[50vh] bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-300 dark:border-gray-700 z-50 flex flex-col">
          <div className="flex justify-between items-center p-2 border-b dark:border-gray-700">
            <h3 className="font-semibold">UI Logs</h3>
            <div className="flex gap-2">
              <button 
                onClick={clearLogs}
                className="text-xs px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded"
              >
                Clear
              </button>
              <button 
                onClick={toggleVisibility}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <X size={18} />
              </button>
            </div>
          </div>
          
          <ScrollArea className="flex-grow p-2">
            <div className="space-y-1 font-mono text-xs">
              {logs.map((log, index) => (
                <div 
                  key={index} 
                  className={`p-1 rounded ${
                    log.type === 'error' ? 'bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-300' :
                    log.type === 'warning' ? 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-300' :
                    log.type === 'success' ? 'bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-300' :
                    'bg-blue-50 dark:bg-blue-900/10 text-blue-800 dark:text-blue-300'
                  }`}
                >
                  <span className="text-gray-500 dark:text-gray-400">
                    {log.timestamp.toLocaleTimeString()}
                  </span>
                  {' '}
                  {log.message}
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>
      )}
    </>
  );
};
