
import React, { useState } from "react";
import { usePaymentHistory } from "@/telegram-mini-app/hooks/usePaymentHistory";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Loader2, Receipt, ChevronDown, ChevronUp, AlertCircle, Calendar, CreditCard, Copy, Check } from "lucide-react";
import { formatCurrency } from "@/telegram-mini-app/utils/formatUtils";
import { format } from "date-fns";
import { motion } from "framer-motion";
import { SectionHeader } from "../ui/SectionHeader";
import { EmptyPaymentHistory } from "./EmptyPaymentHistory";
import { useToast } from "@/components/ui/use-toast";

interface PaymentHistoryTabProps {
  telegramUserId: string | undefined;
  onDiscoverClick?: () => void;
}

export const PaymentHistoryTab: React.FC<PaymentHistoryTabProps> = ({ 
  telegramUserId, 
  onDiscoverClick 
}) => {
  const { payments, isLoading, error } = usePaymentHistory(telegramUserId);
  const [expandedPaymentId, setExpandedPaymentId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const { toast } = useToast();

  console.log("[PaymentHistoryTab] Rendering with:", {
    telegramUserId,
    paymentsCount: payments?.length,
    isLoading,
    hasError: !!error,
    errorMessage: error
  });

  // Detailed plan info debug logging
  if (payments?.length) {
    console.log("[PaymentHistoryTab] All payment plans info:", 
      payments.map(p => ({
        id: p.id.substring(0, 8),
        plan_id: p.plan_id,
        plan: p.plan ? {
          id: p.plan.id,
          name: p.plan.name,
          price: p.plan.price
        } : "No plan object",
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

  const copyToClipboard = (id: string) => {
    navigator.clipboard.writeText(id)
      .then(() => {
        setCopiedId(id);
        toast({
          title: "Copied to clipboard",
          description: "Transaction ID has been copied",
          duration: 2000,
        });
        setTimeout(() => setCopiedId(null), 2000);
      })
      .catch(err => {
        console.error('Failed to copy: ', err);
        toast({
          title: "Failed to copy",
          description: "Could not copy to clipboard",
          variant: "destructive",
        });
      });
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

  // Enhanced plan name handling with better debugging
  const getPlanName = (payment) => {
    console.log(`[PaymentHistoryTab] Getting plan name for payment ${payment.id.substring(0, 8)}:`, {
      plan_object: payment.plan,
      plan_id: payment.plan_id,
      amount: payment.amount
    });
    
    // Direct access to plan name if available - primary option
    if (payment.plan?.name) {
      console.log(`[PaymentHistoryTab] Using direct plan name: "${payment.plan.name}" for payment ${payment.id.substring(0, 8)}`);
      return payment.plan.name; // Use the plan name directly from the plan object
    }
    
    // Fallback option using amount
    if (payment.amount) {
      console.log(`[PaymentHistoryTab] FALLBACK: Using amount as plan name: ${payment.amount} for payment ${payment.id.substring(0, 8)}`);
      return `Plan (${formatCurrency(payment.amount)})`;
    }
    
    // Last resort fallback
    console.log(`[PaymentHistoryTab] FALLBACK: Using "Unknown Plan" for payment ${payment.id.substring(0, 8)}`);
    return "Unknown Plan";
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
        <AlertCircle className="h-10 w-10 text-red-500 mx-auto mb-3" />
        <p className="text-red-500 mb-2 font-medium">Failed to load payment history</p>
        <p className="text-gray-500 text-sm mb-4">Error: {error}</p>
        <p className="text-gray-500 text-sm mb-4">
          User ID: {telegramUserId || "Not available"}
        </p>
      </div>
    );
  }

  if (!payments || payments.length === 0) {
    return (
      <div>
        <SectionHeader
          icon={<Receipt className="h-5 w-5" />}
          title="Payment History"
          description="Track your past transactions"
          gradient="blue"
        />
        <EmptyPaymentHistory onDiscoverClick={onDiscoverClick} />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <SectionHeader
        icon={<Receipt className="h-5 w-5" />}
        title="Payment History"
        description="Track your past transactions"
        gradient="blue"
      />
      
      <ScrollArea className="h-[400px] pr-3">
        <div className="space-y-4">
          {payments.map((payment, index) => (
            <motion.div
              key={payment.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              className="bg-white border rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-all duration-300"
            >
              {/* Payment Card Header - Always visible */}
              <div 
                className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => toggleExpand(payment.id)}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="font-medium flex items-center gap-1.5">
                      {payment.community?.name || "Community"}
                      <Badge 
                        variant={getStatusBadgeVariant(payment.status)}
                        className="ml-2 text-xs"
                      >
                        {payment.status}
                      </Badge>
                    </div>
                    <div className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                      <Calendar className="h-3.5 w-3.5 text-gray-400" />
                      {format(new Date(payment.created_at), 'MMM d, yyyy')}
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-end">
                    <div className="font-semibold text-indigo-600">{formatCurrency(payment.amount)}</div>
                    <div className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                      <CreditCard className="h-3 w-3" />
                      {payment.payment_method || "Unknown method"}
                    </div>
                  </div>
                  
                  <div className="ml-2 flex items-center justify-center h-6 w-6 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors">
                    {expandedPaymentId === payment.id ? 
                      <ChevronUp className="h-4 w-4 text-gray-500" /> : 
                      <ChevronDown className="h-4 w-4 text-gray-500" />}
                  </div>
                </div>
              </div>
              
              {/* Expanded Details Section */}
              {expandedPaymentId === payment.id && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="px-4 pb-4 pt-1 border-t border-gray-100 bg-gray-50"
                >
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
                      <div className="flex items-center gap-1">
                        <p className="font-mono text-xs overflow-hidden text-ellipsis">{payment.id.substring(0, 8)}...</p>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            copyToClipboard(payment.id);
                          }}
                          className="ml-1 p-1 rounded-full hover:bg-gray-200 transition-colors"
                          aria-label="Copy transaction ID"
                        >
                          {copiedId === payment.id ? 
                            <Check className="h-3.5 w-3.5 text-green-500" /> : 
                            <Copy className="h-3.5 w-3.5 text-gray-400 hover:text-gray-600" />}
                        </button>
                      </div>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Date & Time</p>
                      <p>{format(new Date(payment.created_at), 'PPp')}</p>
                    </div>
                  </div>
                </motion.div>
              )}
            </motion.div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};
