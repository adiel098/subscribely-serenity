
import React from "react";
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Subscription } from "../../services/memberService";
import { getDaysRemaining } from "./utils";

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
  
  return (
    <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-lg text-sm">
      <div className="flex items-center gap-2 text-red-700 mb-2">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5"
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
        <span className="font-medium">
          {daysRemaining === 0
            ? "Your subscription expires today!"
            : `Your subscription expires in ${daysRemaining} ${daysRemaining === 1 ? "day" : "days"}!`}
        </span>
      </div>
      <Button 
        onClick={() => onRenew(subscription)}
        className="w-full bg-red-600 hover:bg-red-700 text-white"
        size="sm"
      >
        <RefreshCw className="h-4 w-4 mr-2" />
        Renew Subscription
      </Button>
    </div>
  );
};
