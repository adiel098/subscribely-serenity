
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { 
  X, 
  Bug, 
  ChevronDown, 
  ChevronUp,
  RefreshCw,
  Trash2,
  ClipboardList
} from "lucide-react";
import { NOWPaymentsLogs } from "./NOWPaymentsLogs";
import { NOWPaymentsDebugInfo } from "./NOWPaymentsDebugInfo";

export const DebugMenu: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  
  const clearNOWPaymentsData = () => {
    localStorage.removeItem('nowpayments_transaction');
    localStorage.removeItem('nowpayments_logs');
    window.location.reload();
  };
  
  const showStoredData = () => {
    const transaction = localStorage.getItem('nowpayments_transaction');
    if (transaction) {
      alert(`Stored NOWPayments Transaction: ${transaction}`);
    } else {
      alert('No NOWPayments transaction data stored');
    }
  };

  // Only show in development or with debug param
  if (process.env.NODE_ENV !== 'development' && 
      new URLSearchParams(window.location.search).get('debug') !== 'true') {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Button
        variant="outline"
        size="sm"
        className="bg-gray-800 text-white hover:bg-gray-700 shadow-lg"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Bug className="h-4 w-4 mr-1" />
        דיבאג
        {isOpen ? <ChevronDown className="h-4 w-4 ml-1" /> : <ChevronUp className="h-4 w-4 ml-1" />}
      </Button>
      
      {isOpen && (
        <div className="absolute bottom-12 right-0 w-80 bg-white shadow-lg rounded-lg border p-4">
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-bold">תפריט דיבאג</h3>
            <Button
              variant="ghost" 
              size="sm"
              className="h-6 w-6 p-0"
              onClick={() => setIsOpen(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="space-y-2 text-sm">
            <h4 className="font-semibold">NOWPayments:</h4>
            
            <div className="space-y-2">
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start text-xs"
                onClick={clearNOWPaymentsData}
              >
                <Trash2 className="h-3 w-3 mr-1" />
                נקה נתוני תשלום קריפטו
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start text-xs"
                onClick={showStoredData}
              >
                <ClipboardList className="h-3 w-3 mr-1" />
                הצג נתוני תשלום שמורים
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start text-xs"
                onClick={() => window.location.reload()}
              >
                <RefreshCw className="h-3 w-3 mr-1" />
                רענן דף
              </Button>
            </div>
            
            <div className="pt-2">
              <NOWPaymentsDebugInfo />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
