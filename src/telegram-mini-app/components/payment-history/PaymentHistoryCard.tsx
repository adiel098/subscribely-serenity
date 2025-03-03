
import React, { useState } from "react";
import { format } from "date-fns";
import { PaymentHistoryItem } from "@/telegram-mini-app/hooks/usePaymentHistory";
import {
  Calendar,
  CreditCard,
  ChevronDown,
  ChevronUp,
  Users,
  CheckCircle,
  XCircle,
  ExternalLink
} from "lucide-react";
import { formatCurrency } from "@/telegram-mini-app/utils/formatUtils";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface PaymentHistoryCardProps {
  payment: PaymentHistoryItem;
}

export const PaymentHistoryCard: React.FC<PaymentHistoryCardProps> = ({ payment }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  // Format the created_at date
  const formattedDate = format(new Date(payment.created_at), "MMM d, yyyy");
  
  // Determine payment status badge styling
  const getStatusBadge = () => {
    if (payment.status === "successful") {
      return (
        <Badge variant="success" className="flex items-center gap-1">
          <CheckCircle className="h-3 w-3" />
          Paid
        </Badge>
      );
    }
    return (
      <Badge variant="destructive" className="flex items-center gap-1">
        <XCircle className="h-3 w-3" />
        {payment.status}
      </Badge>
    );
  };

  return (
    <Card 
      className={`mb-3 transition-all duration-300 ${
        isExpanded ? "shadow-md border-purple-200" : "shadow-sm"
      }`}
    >
      <CardHeader className="p-4 cursor-pointer" onClick={() => setIsExpanded(!isExpanded)}>
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            {payment.community?.telegram_photo_url ? (
              <img
                src={payment.community.telegram_photo_url}
                alt={payment.community?.name || "Community"}
                className="h-10 w-10 rounded-full object-cover border border-gray-200"
              />
            ) : (
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Users className="h-5 w-5 text-primary" />
              </div>
            )}
            <div>
              <h3 className="font-medium">{payment.community?.name || "Community"}</h3>
              <div className="text-xs text-gray-500 mt-0.5">
                {payment.plan?.name || "Subscription"}
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="text-right">
              <div className="font-semibold text-base">
                {formatCurrency(payment.amount)}
              </div>
              <div className="flex items-center text-xs text-gray-500 mt-0.5 justify-end">
                <Calendar className="h-3 w-3 mr-1" />
                {formattedDate}
              </div>
            </div>
            
            <div className="flex flex-col items-end">
              {getStatusBadge()}
              <div className="mt-2">
                {isExpanded ? (
                  <ChevronUp className="h-4 w-4 text-gray-400" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-gray-400" />
                )}
              </div>
            </div>
          </div>
        </div>
      </CardHeader>
      
      {isExpanded && (
        <>
          <CardContent className="px-4 pb-3 pt-0 border-t border-gray-100">
            <div className="grid grid-cols-2 gap-y-3 gap-x-4 text-sm">
              <div>
                <div className="text-gray-500 text-xs mb-1">Plan</div>
                <div className="font-medium">{payment.plan?.name || "—"}</div>
              </div>
              <div>
                <div className="text-gray-500 text-xs mb-1">Interval</div>
                <div className="font-medium capitalize">{payment.plan?.interval || "—"}</div>
              </div>
              <div>
                <div className="text-gray-500 text-xs mb-1">Payment Method</div>
                <div className="font-medium flex items-center">
                  <CreditCard className="h-3 w-3 mr-1 text-gray-400" />
                  <span className="capitalize">{payment.payment_method || "Unknown"}</span>
                </div>
              </div>
              <div>
                <div className="text-gray-500 text-xs mb-1">Payment ID</div>
                <div className="font-medium font-mono text-xs truncate">
                  {payment.id.substring(0, 12)}...
                </div>
              </div>
            </div>
          </CardContent>
          
          {payment.invite_link && (
            <CardFooter className="px-4 py-3 bg-gray-50 rounded-b-lg">
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full bg-purple-50 text-purple-700 hover:bg-purple-100 hover:text-purple-800 border border-purple-200 transition-all duration-300"
                onClick={() => window.open(payment.invite_link, "_blank")}
              >
                <ExternalLink className="h-4 w-4 mr-1.5" />
                Visit Community ✨
              </Button>
            </CardFooter>
          )}
        </>
      )}
    </Card>
  );
};
