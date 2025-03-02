
import React, { useState, useEffect } from 'react';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export const TelegramDebugPanel: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [telegramInfo, setTelegramInfo] = useState<Record<string, any>>({});
  const [telegramUserIdResult, setTelegramUserIdResult] = useState<string | null>(null);
  const [extractionAttempts, setExtractionAttempts] = useState<Array<{method: string, result: any}>>([]);

  // Collect debug information
  useEffect(() => {
    gatherTelegramInfo();
  }, []);

  const gatherTelegramInfo = () => {
    // Collect all relevant Telegram WebApp information
    const info: Record<string, any> = {
      windowHasTelegram: typeof window !== 'undefined' && !!window.Telegram,
      hasWebApp: typeof window !== 'undefined' && !!window.Telegram?.WebApp,
      userAgent: navigator.userAgent,
      isInTelegramWebApp: window.Telegram?.WebApp?.initData ? true : false,
      initDataRaw: window.Telegram?.WebApp?.initData,
    };

    // Store the raw WebApp object (stringified) for inspection
    try {
      if (window.Telegram?.WebApp) {
        info.webAppProps = Object.keys(window.Telegram.WebApp);
        info.initDataUnsafe = JSON.stringify(window.Telegram.WebApp.initDataUnsafe);
        
        // Specifically check for user object
        if (window.Telegram.WebApp.initDataUnsafe) {
          info.hasInitDataUnsafe = true;
          info.hasUserObject = !!window.Telegram.WebApp.initDataUnsafe.user;
          if (window.Telegram.WebApp.initDataUnsafe.user) {
            info.userProps = Object.keys(window.Telegram.WebApp.initDataUnsafe.user);
            info.userId = window.Telegram.WebApp.initDataUnsafe.user.id;
          }
        }
      }
    } catch (err) {
      info.webAppError = String(err);
    }

    setTelegramInfo(info);

    // Try multiple ways to extract the Telegram user ID
    const attempts = [];
    try {
      // Method 1: Direct property access
      const method1 = "window.Telegram?.WebApp?.initDataUnsafe?.user?.id?.toString()";
      const result1 = window.Telegram?.WebApp?.initDataUnsafe?.user?.id?.toString();
      attempts.push({ method: method1, result: result1 });
      
      // Method 2: Alternative with explicit checks
      const method2 = "Manual check with explicit conditions";
      let result2 = "null";
      if (window.Telegram && window.Telegram.WebApp && 
          window.Telegram.WebApp.initDataUnsafe && 
          window.Telegram.WebApp.initDataUnsafe.user &&
          window.Telegram.WebApp.initDataUnsafe.user.id) {
        result2 = window.Telegram.WebApp.initDataUnsafe.user.id.toString();
      }
      attempts.push({ method: method2, result: result2 });
      
      // Method 3: Using WebApp.initData JSON parsing
      const method3 = "Parse WebApp.initData JSON";
      let result3 = "null";
      if (window.Telegram?.WebApp?.initData) {
        try {
          const initData = new URLSearchParams(window.Telegram.WebApp.initData);
          const user = JSON.parse(initData.get('user') || 'null');
          result3 = user ? user.id.toString() : "user not in initData";
        } catch (e) {
          result3 = `Error: ${e}`;
        }
      } else {
        result3 = "initData not available";
      }
      attempts.push({ method: method3, result: result3 });

      // Set the result we'll actually use
      setTelegramUserIdResult(result1 || result2 !== "null" ? result2 : null);
      setExtractionAttempts(attempts);
    } catch (err) {
      attempts.push({ method: "Error in extraction process", result: String(err) });
      setExtractionAttempts(attempts);
    }
  };

  const renderObjectTree = (obj: Record<string, any>, level: number = 0) => {
    return Object.entries(obj).map(([key, value]) => {
      const indent = "  ".repeat(level);
      const isObject = value !== null && typeof value === 'object' && !Array.isArray(value);
      const isArray = Array.isArray(value);
      
      return (
        <div key={key} className="font-mono text-xs">
          <span>{indent}{key}: </span>
          {isObject ? (
            <>
              <span>{"{}"}</span>
              <div>{renderObjectTree(value, level + 1)}</div>
            </>
          ) : isArray ? (
            <>
              <span>{"["}</span>
              <div className="ml-4">
                {value.map((item: any, index: number) => (
                  <div key={index}>
                    {typeof item === 'object' && item !== null 
                      ? renderObjectTree(item, level + 1) 
                      : `${indent}  ${JSON.stringify(item)}`}
                  </div>
                ))}
              </div>
              <span>{"]"}</span>
            </>
          ) : (
            <span className="text-blue-500">{JSON.stringify(value)}</span>
          )}
        </div>
      );
    });
  };

  // Toggle debug panel visibility
  const handleTogglePanel = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      gatherTelegramInfo();
    }
  };

  // Force refresh debug info
  const handleRefresh = () => {
    gatherTelegramInfo();
  };

  return (
    <>
      <button
        onClick={handleTogglePanel}
        className="fixed top-4 right-4 bg-red-600 text-white rounded-full w-10 h-10 flex items-center justify-center shadow-lg z-50"
        title="Debug Telegram"
      >
        🐞
      </button>
      
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle className="flex justify-between items-center">
              <span>Telegram Debug Panel</span>
              <Button variant="outline" size="sm" onClick={handleRefresh}>
                Refresh Data
              </Button>
            </DialogTitle>
          </DialogHeader>
          
          <ScrollArea className="h-[calc(80vh-80px)]">
            <div className="space-y-4 p-4">
              <div className="bg-red-50 border border-red-200 rounded-md p-4">
                <h3 className="font-bold text-red-800 mb-2">🔑 Telegram User ID Extraction</h3>
                <div className="space-y-2">
                  <div className="font-semibold">Final result: {telegramUserIdResult || "FAILED TO EXTRACT"}</div>
                  
                  <h4 className="font-semibold text-sm mt-4">Extraction attempts:</h4>
                  {extractionAttempts.map((attempt, index) => (
                    <div key={index} className="bg-white p-2 rounded border text-xs">
                      <div className="font-mono">{attempt.method}:</div>
                      <div className={`font-mono ${attempt.result ? 'text-green-600' : 'text-red-600'}`}>
                        Result: {JSON.stringify(attempt.result)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="bg-gray-50 border rounded-md p-4">
                <h3 className="font-bold mb-2">🌐 Telegram Environment</h3>
                <div className="space-y-1">
                  <div>In Telegram WebApp: {telegramInfo.isInTelegramWebApp ? "✅ Yes" : "❌ No"}</div>
                  <div>User Agent: {telegramInfo.userAgent}</div>
                </div>
              </div>
              
              <div className="bg-gray-50 border rounded-md p-4">
                <h3 className="font-bold mb-2">📊 Raw Telegram Data</h3>
                <div className="bg-gray-900 text-gray-100 p-4 rounded-md overflow-auto">
                  {renderObjectTree(telegramInfo)}
                </div>
              </div>
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </>
  );
};
