
import React from "react";
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Subscription } from "../../services/memberService";
import { getDaysRemaining, getTimeRemainingText } from "./utils";
import { formatCurrency } from "../../utils/formatUtils";

interface ExpirationWarningProps {
  subscription: Subscription;
  onRenew: (subscription: Subscription) => void;
}

export const ExpirationWarning: React.FC<ExpirationWarningProps> = ({
  subscription,
  onRenew
}) => {
  const daysRemaining = getDaysRemaining(subscription);
  
  if (daysRemaining > 3) {
    return null;
  }
  
  const communityName = subscription.community?.name || "Community";
  const timeRemainingText = getTimeRemainingText(subscription);
  const planPrice = subscription.plan?.price 
    ? formatCurrency(subscription.plan.price) 
    : "";
  
  return (
    <div className="mt-2 mb-2 p-2 bg-red-50 border border-red-200 rounded-md text-xs">
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-1 text-red-700">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-3 w-3"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
            <line x1="12" y1="9" x2="12" y2="13"></line>
            <line x1="12" y1="17" x2="12.01" y2="17"></line>
          </svg>
          <span className="font-semibold truncate max-w-[150px]">{communityName}</span>
        </div>
        <span className="text-red-600 font-medium">{timeRemainingText}</span>
      </div>
      <Button 
        onClick={() => onRenew(subscription)}
        className="w-full h-7 text-xs bg-red-600 hover:bg-red-700 text-white py-0"
        size="sm"
      >
        <RefreshCw className="h-3 w-3 mr-1" />
        Renew {planPrice}
      </Button>
    </div>
  );
};
