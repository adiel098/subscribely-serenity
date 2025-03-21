
import React from "react";
import { Receipt } from "lucide-react";
import { usePaymentHistory } from "@/telegram-mini-app/hooks/usePaymentHistory";
import { EmptyPaymentHistory } from "./EmptyPaymentHistory";
import { SectionHeader } from "../ui/SectionHeader";
import { TransactionCopyButton } from "./TransactionCopyButton";
import { PaymentDiagnostics } from "./PaymentDiagnostics";

interface PaymentHistoryTabProps {
  telegramUserId?: string;
  onDiscoverClick?: () => void;
}

export const PaymentHistoryTab: React.FC<PaymentHistoryTabProps> = ({
  telegramUserId,
  onDiscoverClick
}) => {
  const { payments, isLoading, error } = usePaymentHistory(telegramUserId);
  
  return (
    <div className="space-y-4 min-h-[calc(100vh-120px)]">
      <SectionHeader
        icon={<Receipt className="h-5 w-5" />}
        title="Payment History"
        description="Your transaction history and receipts"
        gradient="blue"
      />
      
      {isLoading ? (
        <div className="bg-white rounded-lg border shadow-sm p-4 flex justify-center items-center h-40">
          <div className="animate-pulse flex space-x-4">
            <div className="flex-1 space-y-4 py-1">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded w-5/6"></div>
              </div>
            </div>
          </div>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
          An error occurred while loading your payment history
        </div>
      ) : payments && payments.length > 0 ? (
        <div className="bg-white rounded-lg border shadow-sm overflow-hidden mb-16">
          <div className="min-w-full divide-y">
            <div className="bg-gray-50">
              <div className="grid grid-cols-3 py-3 text-xs font-medium text-gray-500">
                <div className="px-4">Date</div>
                <div className="px-4">Amount</div>
                <div className="px-4">ID</div>
              </div>
            </div>
            <div className="divide-y divide-gray-200">
              {payments.map((payment) => (
                <div key={payment.id} className="grid grid-cols-3 py-3 text-sm">
                  <div className="px-4 font-medium text-gray-900">
                    {new Date(payment.created_at).toLocaleDateString()}
                  </div>
                  <div className="px-4 text-gray-500">
                    ${payment.amount?.toFixed(2) || "N/A"}
                  </div>
                  <div className="px-4 text-gray-500 flex items-center">
                    <span className="truncate max-w-[80px]">{payment.id.substring(0, 8)}</span>
                    <TransactionCopyButton transactionId={payment.id} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <EmptyPaymentHistory onDiscoverClick={onDiscoverClick} />
      )}
      
      {/* Optional: Payment diagnostics for debugging */}
      {process.env.NODE_ENV === 'development' && (
        <PaymentDiagnostics telegramUserId={telegramUserId} payments={payments} />
      )}
    </div>
  );
};
