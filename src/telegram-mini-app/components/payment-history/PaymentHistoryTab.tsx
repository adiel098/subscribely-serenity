import React from "react";
import { usePaymentHistory } from "@/telegram-mini-app/hooks/usePaymentHistory";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, Receipt, RotateCcw, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PaymentHistoryCard } from "./PaymentHistoryCard";

interface PaymentHistoryTabProps {
  telegramUserId: string | undefined;
}

export const PaymentHistoryTab: React.FC<PaymentHistoryTabProps> = ({ telegramUserId }) => {
  const { payments, isLoading, error, refetch } = usePaymentHistory(telegramUserId);

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
        <p className="text-red-500 mb-4">Failed to load payment history</p>
        <Button onClick={() => refetch()} variant="outline" size="sm">
          Try Again
        </Button>
      </div>
    );
  }

  if (!payments || payments.length === 0) {
    return (
      <div className="text-center py-12">
        <Receipt className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-medium">No Payment History</h3>
        <p className="text-muted-foreground mt-2">
          You haven't made any payments yet.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold mb-4">Payment History</h3>
      <ScrollArea className="h-[400px] rounded-md border">
        <div className="p-4 space-y-4">
          {payments.map((payment) => (
            <PaymentHistoryCard key={payment.id} payment={payment} />
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};
