
import React from "react";
import { usePaymentHistory } from "@/telegram-mini-app/hooks/usePaymentHistory";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Loader2, Receipt, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/telegram-mini-app/utils/formatUtils";
import { format } from "date-fns";

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
            <div
              key={payment.id}
              className="bg-card border rounded-lg p-4 shadow-sm"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-medium">{payment.community?.name || "Community"}</h4>
                  <p className="text-sm text-muted-foreground">
                    {payment.plan?.name || "Subscription"}
                  </p>
                </div>
                <Badge variant={payment.status === "successful" ? "success" : "destructive"}>
                  {payment.status === "successful" ? "Paid" : payment.status}
                </Badge>
              </div>
              
              <div className="mt-3 pt-3 border-t grid grid-cols-2 gap-2 text-sm">
                <div>
                  <p className="text-muted-foreground">Amount</p>
                  <p className="font-medium">{formatCurrency(payment.amount)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Date</p>
                  <p>{format(new Date(payment.created_at), 'MMM d, yyyy')}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Payment Method</p>
                  <p className="capitalize">{payment.payment_method || "Unknown"}</p>
                </div>
                {payment.invite_link && (
                  <div className="col-span-2 mt-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full" 
                      onClick={() => window.open(payment.invite_link, "_blank")}
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Open Invite Link
                    </Button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};
