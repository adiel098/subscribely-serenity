
import React, { useState, useEffect } from 'react';
import { RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const NOWPaymentsDebugInfo: React.FC = () => {
  const [storedTransaction, setStoredTransaction] = useState<any>(null);
  
  useEffect(() => {
    loadStoredTransaction();
  }, []);
  
  const loadStoredTransaction = () => {
    const transactionData = localStorage.getItem('nowpayments_transaction');
    if (transactionData) {
      try {
        setStoredTransaction(JSON.parse(transactionData));
      } catch (e) {
        console.error("Error parsing stored transaction:", e);
      }
    }
  };
  
  if (!storedTransaction) {
    return (
      <div className="text-sm p-2 bg-gray-50 rounded border">
        <p className="text-gray-500">No active crypto payment transaction found.</p>
      </div>
    );
  }
  
  const timeAgo = () => {
    if (!storedTransaction?.timestamp) return 'Unknown time';
    
    const seconds = Math.floor((Date.now() - storedTransaction.timestamp) / 1000);
    
    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return `${Math.floor(seconds/60)} minutes ago`;
    if (seconds < 86400) return `${Math.floor(seconds/3600)} hours ago`;
    return `${Math.floor(seconds/86400)} days ago`;
  };
  
  return (
    <div className="text-xs p-2 bg-gray-50 rounded border">
      <div className="flex justify-between mb-2">
        <h4 className="font-semibold">Active Payment Transaction</h4>
        <Button 
          variant="ghost" 
          size="sm" 
          className="h-6 w-6 p-0"
          onClick={loadStoredTransaction}
        >
          <RefreshCw className="h-3 w-3" />
        </Button>
      </div>
      
      <div className="space-y-1 font-mono">
        {storedTransaction.invoiceId && (
          <div><strong>Invoice ID:</strong> {storedTransaction.invoiceId}</div>
        )}
        {storedTransaction.orderId && (
          <div><strong>Order ID:</strong> {storedTransaction.orderId}</div>
        )}
        <div><strong>Amount:</strong> ${storedTransaction.amount}</div>
        <div><strong>Created:</strong> {timeAgo()}</div>
        {storedTransaction.paymentUrl && (
          <div className="pt-1">
            <Button 
              size="sm"
              variant="outline" 
              className="w-full text-xs h-7 mt-1"
              onClick={() => window.open(storedTransaction.paymentUrl, '_blank')}
            >
              Open Payment Page
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
