import React, { useState } from "react";
import { useDatabaseDiagnostics } from "@/telegram-mini-app/hooks/useDatabaseDiagnostics";
import { Button } from "@/components/ui/button";
import { Loader2, Database, Bug, RefreshCw, FileText } from "lucide-react";
import { PaymentHistoryItem } from "@/telegram-mini-app/hooks/usePaymentHistory";

interface PaymentDiagnosticsProps {
  telegramUserId: string | undefined;
  payments?: PaymentHistoryItem[];
  onClose?: () => void;
}

export const PaymentDiagnostics: React.FC<PaymentDiagnosticsProps> = ({
  telegramUserId,
  payments = [],
  onClose
}) => {
  const { runDiagnostics, isLoading, results, error } = useDatabaseDiagnostics();
  const [diagnosticsRun, setDiagnosticsRun] = useState(false);
  
  const handleRunDiagnostics = async () => {
    if (!telegramUserId) return;
    
    await runDiagnostics({ 
      action: 'check_user_payments', 
      telegram_user_id: telegramUserId 
    });
    setDiagnosticsRun(true);
  };

  const handleCheckUserExists = async () => {
    if (!telegramUserId) return;
    
    await runDiagnostics({ 
      action: 'check_user_exists', 
      telegram_user_id: telegramUserId 
    });
    setDiagnosticsRun(true);
  };

  const handleCheckTable = async () => {
    await runDiagnostics({ 
      action: 'table_info', 
      table_name: 'subscription_payments' 
    });
    setDiagnosticsRun(true);
  };
  
  const handleCheckPlanDetails = async () => {
    // Get the plan_id from the first payment if available
    const planId = payments && payments.length > 0 ? payments[0].plan_id : null;
    
    if (planId) {
      await runDiagnostics({
        action: 'check_plan_details',
        plan_id: planId
      });
      setDiagnosticsRun(true);
    } else {
      // If no plan_id is available, check project_plans table structure
      const tableStructure = await runDiagnostics({
        action: 'table_info',
        table_name: 'project_plans'
      });
      setDiagnosticsRun(true);
    }
  };

  return (
    <div className="bg-white border border-red-100 rounded-lg p-4 mb-6">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center">
          <Bug className="h-5 w-5 text-red-500 mr-2" />
          <h3 className="font-medium text-red-700">Payment History Diagnostics</h3>
        </div>
        {onClose && (
          <Button variant="ghost" size="sm" onClick={onClose}>
            Close
          </Button>
        )}
      </div>
      
      <div className="space-y-3 mb-4">
        <p className="text-sm text-gray-600">
          Run diagnostics to help identify issues with payment history loading:
        </p>
        
        <div className="flex flex-wrap gap-2">
          <Button 
            size="sm" 
            variant="outline" 
            disabled={isLoading} 
            onClick={handleRunDiagnostics}
          >
            {isLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <RefreshCw className="h-4 w-4 mr-2" />}
            Check Payment Records
          </Button>
          
          <Button 
            size="sm" 
            variant="outline" 
            disabled={isLoading} 
            onClick={handleCheckUserExists}
          >
            {isLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <RefreshCw className="h-4 w-4 mr-2" />}
            Check User Exists
          </Button>
          
          <Button 
            size="sm" 
            variant="outline" 
            disabled={isLoading} 
            onClick={handleCheckTable}
          >
            {isLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Database className="h-4 w-4 mr-2" />}
            Check Payment Table
          </Button>
          
          <Button 
            size="sm" 
            variant="outline" 
            disabled={isLoading} 
            onClick={handleCheckPlanDetails}
          >
            {isLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <FileText className="h-4 w-4 mr-2" />}
            Check Plan Details
          </Button>
        </div>
      </div>
      
      {isLoading && (
        <div className="flex items-center justify-center py-4">
          <Loader2 className="h-6 w-6 text-primary animate-spin" />
          <span className="ml-2">Running diagnostics...</span>
        </div>
      )}
      
      {error && (
        <div className="bg-red-50 p-3 rounded text-red-700 text-sm mb-3">
          <p className="font-medium">Error running diagnostics:</p>
          <p className="mt-1">{error}</p>
        </div>
      )}
      
      {diagnosticsRun && results && !isLoading && (
        <div className="mt-4">
          <h4 className="text-sm font-medium mb-2">Diagnostics Results:</h4>
          <pre className="bg-gray-50 p-3 rounded text-xs overflow-auto max-h-[300px]">
            {JSON.stringify(results, null, 2)}
          </pre>
        </div>
      )}
      
      <div className="mt-4 text-xs text-gray-500 border-t pt-3">
        <p>Telegram User ID: {telegramUserId || "Not available"}</p>
        {payments && payments.length > 0 && (
          <p>Payment Records: {payments.length}</p>
        )}
      </div>
    </div>
  );
};
