import React, { useState } from "react";
import { usePaymentHistory } from "@/telegram-mini-app/hooks/usePaymentHistory";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Loader2, Receipt, ExternalLink, ChevronDown, ChevronUp, RefreshCw, AlertCircle, Bug } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/telegram-mini-app/utils/formatUtils";
import { format } from "date-fns";
import { PaymentDiagnostics } from "./PaymentDiagnostics";

interface PaymentHistoryTabProps {
  telegramUserId: string | undefined;
}

export const PaymentHistoryTab: React.FC<PaymentHistoryTabProps> = ({ telegramUserId }) => {
  const { payments, isLoading, error, refetch } = usePaymentHistory(telegramUserId);
  const [expandedPaymentId, setExpandedPaymentId] = useState<string | null>(null);
  const [showDiagnostics, setShowDiagnostics] = useState(false);

  console.log("[PaymentHistoryTab] Rendering with:", {
    telegramUserId,
    paymentsCount: payments?.length,
    isLoading,
    hasError: !!error,
    errorMessage: error
  });

  // Debug output for payment plan data
  if (payments?.length) {
    console.log("[PaymentHistoryTab] First payment plan data:", {
      plan: payments[0].plan,
      plan_id: payments[0].plan_id,
      amount: payments[0].amount
    });
    
    // Log all payment plans for debugging
    console.log("[PaymentHistoryTab] All payment plans:", 
      payments.map(p => ({
        id: p.id.substring(0, 8),
        plan_id: p.plan_id,
        plan_name: p.plan?.name,
        amount: p.amount
      }))
    );
  }

  const toggleExpand = (paymentId: string) => {
    if (expandedPaymentId === paymentId) {
      setExpandedPaymentId(null);
    } else {
      setExpandedPaymentId(paymentId);
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status.toLowerCase()) {
      case 'successful':
      case 'completed':
        return 'success';
      case 'failed':
      case 'cancelled':
        return 'destructive';
      case 'pending':
        return 'warning';
      default:
        return 'secondary';
    }
  };

  // Improved helper to get plan name with better fallback handling
  const getPlanName = (payment) => {
    // If we have a plan object with a non-fallback name, use it
    if (payment.plan?.name && !payment.plan.name.startsWith('Plan (')) {
      console.log(`[PaymentHistoryTab] Using real plan name: ${payment.plan.name} for payment ${payment.id.substring(0, 8)}`);
      return payment.plan.name;
    }
    
    // If we're using a fallback name with amount, make it clearer
    if (payment.amount) {
      console.log(`[PaymentHistoryTab] Using fallback plan name with amount: ${payment.amount} for payment ${payment.id.substring(0, 8)}`);
      return `Plan (${formatCurrency(payment.amount)})`;
    }
    
    // Last resort fallback
    console.log(`[PaymentHistoryTab] Using last resort fallback for payment ${payment.id.substring(0, 8)}`);
    return "Unknown Plan";
  };

  // Handle refreshing with additional debugging
  const handleRefresh = () => {
    console.log("[PaymentHistoryTab] Manual refresh requested");
    refetch();
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-40">
        <Loader2 className="h-8 w-8 text-primary animate-spin" />
        <span className="ml-2">Loading payment history...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        {showDiagnostics && (
          <PaymentDiagnostics 
            telegramUserId={telegramUserId} 
            onClose={() => setShowDiagnostics(false)} 
          />
        )}
        
        <AlertCircle className="h-10 w-10 text-red-500 mx-auto mb-3" />
        <p className="text-red-500 mb-2 font-medium">Failed to load payment history</p>
        <p className="text-gray-500 text-sm mb-4">Error: {error}</p>
        <p className="text-gray-500 text-sm mb-4">
          User ID: {telegramUserId || "Not available"}
        </p>
        <div className="flex flex-wrap gap-2 justify-center">
          <Button onClick={() => refetch()} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Again
          </Button>
          <Button 
            onClick={() => setShowDiagnostics(!showDiagnostics)} 
            variant="outline" 
            size="sm"
          >
            <Bug className="h-4 w-4 mr-2" />
            {showDiagnostics ? "Hide Diagnostics" : "Run Diagnostics"}
          </Button>
        </div>
      </div>
    );
  }

  if (!payments || payments.length === 0) {
    return (
      <div className="text-center py-12">
        {showDiagnostics && (
          <PaymentDiagnostics 
            telegramUserId={telegramUserId} 
            onClose={() => setShowDiagnostics(false)} 
          />
        )}
        
        <Receipt className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-medium">No Payment History</h3>
        <p className="text-muted-foreground mt-2 mb-4">
          You haven't made any payments yet.
        </p>
        <div className="flex flex-wrap gap-2 justify-center">
          <Button onClick={() => refetch()} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button 
            onClick={() => setShowDiagnostics(!showDiagnostics)} 
            variant="outline" 
            size="sm"
          >
            <Bug className="h-4 w-4 mr-2" />
            {showDiagnostics ? "Hide Diagnostics" : "Run Diagnostics"}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {showDiagnostics && (
        <PaymentDiagnostics 
          telegramUserId={telegramUserId} 
          onClose={() => setShowDiagnostics(false)} 
        />
      )}
      
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold">Payment History</h3>
        <div className="flex gap-2">
          <Button 
            onClick={() => setShowDiagnostics(!showDiagnostics)} 
            variant="ghost" 
            size="sm"
          >
            <Bug className="h-4 w-4 mr-1" />
            {showDiagnostics ? "Hide" : "Debug"}
          </Button>
          <Button onClick={handleRefresh} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>
      
      <ScrollArea className="h-[400px] pr-3">
        <div className="space-y-4">
          {payments.map((payment) => (
            <div
              key={payment.id}
              className="bg-white border rounded-lg shadow-sm overflow-hidden"
            >
              {/* Payment Card Header - Always visible */}
              <div 
                className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => toggleExpand(payment.id)}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="font-medium">{payment.community?.name || "Community"}</div>
                    <div className="text-sm text-muted-foreground">
                      {format(new Date(payment.created_at), 'MMM d, yyyy')}
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-end">
                    <div className="font-semibold">{formatCurrency(payment.amount)}</div>
                    <Badge variant={getStatusBadgeVariant(payment.status)}>
                      {payment.status}
                    </Badge>
                  </div>
                  
                  <div className="ml-2">
                    {expandedPaymentId === payment.id ? 
                      <ChevronUp className="h-5 w-5 text-gray-400" /> : 
                      <ChevronDown className="h-5 w-5 text-gray-400" />}
                  </div>
                </div>
              </div>
              
              {/* Expanded Details Section */}
              {expandedPaymentId === payment.id && (
                <div className="px-4 pb-4 pt-1 border-t border-gray-100 bg-gray-50">
                  <div className="grid grid-cols-2 gap-3 text-sm mb-3">
                    <div>
                      <p className="text-muted-foreground">Plan</p>
                      <p className="font-medium">{getPlanName(payment)}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Payment Method</p>
                      <p className="font-medium capitalize">{payment.payment_method || "Unknown"}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Transaction ID</p>
                      <p className="font-mono text-xs overflow-hidden text-ellipsis">{payment.id.substring(0, 8)}...</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Date & Time</p>
                      <p>{format(new Date(payment.created_at), 'PPp')}</p>
                    </div>
                  </div>
                  
                  {payment.invite_link && (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full mt-2" 
                      onClick={(e) => {
                        e.stopPropagation();
                        window.open(payment.invite_link, "_blank");
                      }}
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Open Invite Link
                    </Button>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};
